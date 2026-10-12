<#
.SYNOPSIS
    Run the game-asset pipeline with a Python that has Pillow.

.DESCRIPTION
    This machine has no usable system Python (the `python` on PATH is the Windows
    Store stub) and the pipeline needs Pillow. DSH ships a managed runtime with
    both, so this wrapper resolves one and forwards every argument verbatim.

    Two details make this work:

      * No param() block. The native call operator forwards to the executable, so
        PowerShell never tries to bind `-o` to its own common parameters
        (-OutVariable, -OutBuffer). A param()-based wrapper dies with
        "parameter name 'o' is ambiguous" on `grant ... -o out.png`.
      * The interpreter probe clears $ErrorActionPreference around the call,
        because a native non-zero exit would otherwise abort the script under
        'Stop' instead of reporting "this python has no Pillow".

    Resolution order for the interpreter:
      1. $env:DSH_PYTHON, for an explicit override
      2. the newest $env:DSH_HOME\dsh-runtimes\<runtime>\dependencies\python\python.exe
      3. python.exe on PATH, if it can import PIL

.EXAMPLE
    pwsh -NoProfile -ExecutionPolicy Bypass -File run.ps1 verify --dir sheet
    pwsh -NoProfile -ExecutionPolicy Bypass -File run.ps1 grant raw\ref.png -o keyed\ref.png
    pwsh -NoProfile -ExecutionPolicy Bypass -File run.ps1 sheet --frames frames --out sheet --grid 192
    pwsh -NoProfile -ExecutionPolicy Bypass -File run.ps1 flow new --spec batch.spec.json
    pwsh -NoProfile -ExecutionPolicy Bypass -File run.ps1 python      # print the interpreter, for the project's own scripts

TWO SCRIPTS, ONE WRAPPER. Everything except `flow` goes to `asset_pipeline.py` -- the substrate (grant, key, plan,
sheet, atlas, verify). `flow` goes to `asset_flow.py`, the pipeline that stands on top of it. The split is
deliberate rather than tidy: `asset_pipeline.py` is kept byte-identical between this skill and `refs/`, so new
work must not go inside it, and the wrapper is where both become reachable by the same name.
#>
$ErrorActionPreference = 'Stop'

$pipeline = Join-Path $PSScriptRoot 'asset_pipeline.py'
if (-not (Test-Path $pipeline)) { throw "asset_pipeline.py not found next to this script ($pipeline)" }

function Test-Pillow([string] $exe) {
    if (-not $exe -or -not (Test-Path $exe)) { return $false }
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $exe -c 'import PIL' 2>&1 | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    } finally {
        $ErrorActionPreference = $previous
    }
}

$candidates = @()
if ($env:DSH_PYTHON) { $candidates += $env:DSH_PYTHON }

$harnessHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$runtimeRoot = Join-Path $harnessHome 'dsh-runtimes'
if (Test-Path $runtimeRoot) {
    $candidates += Get-ChildItem $runtimeRoot -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName 'dependencies\python\python.exe' }
}

$onPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if ($onPath) { $candidates += $onPath }

$python = $null
foreach ($candidate in $candidates) {
    if (Test-Pillow $candidate) { $python = $candidate; break }
}

if (-not $python) {
    $tried = $candidates -join "`n  "
    throw "No Python with Pillow found. Tried:`n  $tried`nSet `$env:DSH_PYTHON to a python.exe that has Pillow, or open DSH once so its managed runtime is unpacked under $runtimeRoot, then retry."
}

# `run.ps1 python` prints the interpreter it resolved and nothing else.
#
# The pipeline is not the only thing on this machine that needs looking up that interpreter: the project's own
# `scripts/import-sheet.py` and `scripts/compose-swim-tail.py` import PIL and numpy as well, and running them with
# `python` gets the Windows Store stub, which exits without doing anything. So the resolution is printed once and
# the caller passes it along:
#
#     $py = pwsh -NoProfile -File .claude\skills\game-asset\scripts\run.ps1 python
#     & $py scripts\import-sheet.py sheet.png --name 名字 --cols 2 --rows 2
if ($args.Count -ge 1 -and $args[0] -eq 'python') { $python; exit 0 }

# `flow <subcommand> [args]` -> asset_flow.py. Anything else -> asset_pipeline.py, so every command in the skill's
# documentation keeps working exactly as written.
$ErrorActionPreference = 'Continue'
if ($args.Count -ge 1 -and $args[0] -eq 'flow') {
    $flow = Join-Path $PSScriptRoot 'asset_flow.py'
    if (-not (Test-Path $flow)) { throw "asset_flow.py not found next to this script ($flow)" }
    # `@(...)` is not decoration. `$args[1..1]` is a SCALAR when there is exactly one trailing argument, and
    # splatting a scalar string enumerates its CHARACTERS -- so `flow --help` arrived at argparse as `-`, `-`, `h`,
    # ... and died with "invalid choice: '-'" while every multi-argument call worked. Wrapping the slice in `@()`
    # keeps it a collection whatever its length.
    $rest = @()
    if ($args.Count -gt 1) { $rest = @($args[1..($args.Count - 1)]) }
    & $python $flow @rest
    exit $LASTEXITCODE
}
& $python $pipeline @args
exit $LASTEXITCODE
