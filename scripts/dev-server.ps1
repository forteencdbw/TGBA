# Start / stop / status for the Vite dev server, as a process that survives the agent session.
#
# Background jobs started through the agent's job runner are reaped when the turn ends, which
# killed the dev server repeatedly. A process started here lives in its own process tree, so it
# keeps running -- and because it is detached we track it by PORT rather than by the pid that
# Start-Process hands back (that one is the CLI wrapper, not the process that actually listens).
#
#   powershell -File scripts\dev-server.ps1 start
#   powershell -File scripts\dev-server.ps1 stop
#   powershell -File scripts\dev-server.ps1 status
#
# Default (no argument) is start.

param([ValidateSet('start', 'stop', 'status')][string]$Action = 'start')

$ErrorActionPreference = 'Stop'
$root = 'D:\TGBA'
$port = 5173
$outLog = Join-Path $root '.devserver.log'
$errLog = Join-Path $root '.devserver.err.log'

function Get-Listener {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $conn) { return $null }
  return Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
}

function Test-Up {
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 8
    return $r.StatusCode -eq 200
  } catch {
    return $false
  }
}

switch ($Action) {
  'status' {
    $proc = Get-Listener
    if ($proc) {
      "RUNNING: pid $($proc.Id) on port $port (http $(if (Test-Up) { 'ok' } else { 'NOT RESPONDING' }))"
      "url: http://localhost:$port/"
    } else {
      "STOPPED: nothing listening on port $port"
    }
  }

  'stop' {
    $proc = Get-Listener
    if (-not $proc) { "STOPPED: nothing listening on port $port"; break }
    # The CLI wrapper and the listening child both belong to this server; kill the tree by port.
    Get-CimInstance Win32_Process -Filter "ParentProcessId = $($proc.Id)" -ErrorAction SilentlyContinue |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 600
    if (Get-Listener) { "FAILED: port $port is still held" } else { "STOPPED: port $port released" }
  }

  'start' {
    if (Get-Listener) {
      "ALREADY RUNNING: pid $((Get-Listener).Id) on port $port"
      break
    }

    $node = (Get-Command node).Source
    $vite = Join-Path $root 'node_modules\vite\bin\vite.js'
    if (-not (Test-Path $vite)) { "VITE NOT FOUND at $vite - run: pnpm install"; exit 1 }

    Start-Process -FilePath $node -ArgumentList @($vite, '--port', "$port", '--strictPort') `
      -WorkingDirectory $root -WindowStyle Hidden `
      -RedirectStandardOutput $outLog -RedirectStandardError $errLog | Out-Null

    # Wait for the listener rather than trusting the pid we were handed.
    $proc = $null
    for ($i = 0; $i -lt 40; $i++) {
      Start-Sleep -Milliseconds 250
      $proc = Get-Listener
      if ($proc) { break }
    }

    if (-not $proc) {
      "FAILED to start. stderr:"
      Get-Content $errLog -ErrorAction SilentlyContinue | Select-Object -First 15
      exit 1
    }

    "STARTED: pid $($proc.Id) on port $port"
    "url: http://localhost:$port/"
    "stop: powershell -File scripts\dev-server.ps1 stop"
  }
}
