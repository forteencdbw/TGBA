# Installs a stable PATH entry so `pwsh` resolves.
#
# Why this exists: PowerShell 7 was installed as an MSIX package under
#   C:\Program Files\WindowsApps\Microsoft.PowerShell_<version>_x64__8wekyb3d8bbwe
# The machine PATH still pointed at the 7.6.4 package directory, which no longer exists after the
# 7.6.6 upgrade, so `pwsh` was unresolvable.
#
# Two traps this script works around:
#   1. PATH scanning skips the WindowsApps directory itself, so putting a junction INSIDE
#      WindowsApps does not help -- `where pwsh` still finds nothing. The junction has to live
#      outside it.
#   2. A literal versioned path breaks on every future upgrade, so the entry points at a stable
#      junction instead.

$ErrorActionPreference = 'Stop'

# Discover the installed package rather than hardcoding a version, so re-running this after a
# PowerShell upgrade fixes the junction instead of failing on a stale path.
$packageRoot = 'C:\Program Files\WindowsApps'
$package = Get-ChildItem $packageRoot -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like 'Microsoft.PowerShell_*_x64__8wekyb3d8bbwe' } |
  Where-Object { Test-Path (Join-Path $_.FullName 'pwsh.exe') } |
  Sort-Object { [version]([regex]::Match($_.Name, '_(\d+\.\d+\.\d+\.\d+)_').Groups[1].Value) } -Descending |
  Select-Object -First 1

if (-not $package) {
  throw "No PowerShell 7 MSIX package with pwsh.exe found under $packageRoot"
}
$package = $package.FullName

$stable = Join-Path $env:LOCALAPPDATA 'pwsh7'
$report = [ordered]@{}
$report.package = $package

# --- 1. Stable junction ----------------------------------------------------
$existing = Get-Item $stable -Force -ErrorAction SilentlyContinue
if ($existing) {
  $target = @($existing.Target)[0]
  if ($target -eq $package) {
    $report.junction = "already correct -> $target"
  } else {
    # Points at an older package: repoint it.
    Remove-Item $stable -Force -Recurse
    New-Item -ItemType Junction -Path $stable -Target $package | Out-Null
    $report.junction = "repointed $target -> $package"
  }
} else {
  New-Item -ItemType Junction -Path $stable -Target $package | Out-Null
  $report.junction = "created -> $package"
}

if (-not (Test-Path (Join-Path $stable 'pwsh.exe'))) {
  throw "junction created but pwsh.exe is not reachable through it"
}

# --- 2. Clean up the junction that does not work ---------------------------
# A junction inside WindowsApps is invisible to PATH scanning; do not leave the trap behind.
$trap = Join-Path (Join-Path $env:LOCALAPPDATA 'Microsoft\WindowsApps') 'PowerShell7'
if (Test-Path $trap) {
  Remove-Item $trap -Force -Recurse
  $report.removedTrapJunction = $trap
}

# --- 3. User PATH ----------------------------------------------------------
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$entries = @($userPath -split ';' | Where-Object { $_ -ne '' })
$report.entriesBefore = $entries.Count

# Drop versioned WindowsApps entries: they are dead the moment the package updates.
$staleCount = @($entries | Where-Object { $_ -match 'WindowsApps\\Microsoft\.PowerShell_' }).Count
$entries = @($entries | Where-Object { $_ -notmatch 'WindowsApps\\Microsoft\.PowerShell_' })
$report.removedStaleEntries = $staleCount

if ($entries -notcontains $stable) { $entries += $stable }
$newPath = $entries -join ';'

if ($newPath -ne $userPath) {
  [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
  $report.userPath = 'updated'
} else {
  $report.userPath = 'unchanged'
}

# Windows truncates a user PATH beyond 1024 characters; warn rather than silently corrupting it.
$report.userPathLength = $newPath.Length
if ($newPath.Length -gt 1024) { $report.WARNING = 'user PATH exceeds 1024 chars and may be truncated' }

$readBack = [Environment]::GetEnvironmentVariable('Path', 'User')
$report.readBackHasStable = (@($readBack -split ';') -contains $stable)
$report.readBackHasStale = (@($readBack -split ';' | Where-Object { $_ -match 'WindowsApps\\Microsoft\.PowerShell_' }).Count -gt 0)

# --- 4. Machine PATH (report only: needs admin to change) ------------------
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$machineStale = @($machinePath -split ';' | Where-Object { $_ -match 'WindowsApps\\Microsoft\.PowerShell_' })
$report.machinePathStaleEntries = if ($machineStale.Count) { $machineStale -join ' | ' } else { 'none' }

# --- 5. Verify ------------------------------------------------------------
$env:PATH = $machinePath + ';' + $readBack
$cmd = Get-Command pwsh -ErrorAction SilentlyContinue
$report.pwshResolvesTo = if ($cmd) { $cmd.Source } else { 'NOT FOUND' }
$report.pwshVersion = (& pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' 2>&1) -join ''

Write-Output '===== REPORT ====='
$report.GetEnumerator() | ForEach-Object { '{0,-26} {1}' -f $_.Key, $_.Value }
