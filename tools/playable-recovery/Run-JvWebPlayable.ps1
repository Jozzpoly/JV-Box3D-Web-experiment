[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 5173,
    [string]$WorkspaceRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$runtimeCommit = 'd6aa218064c2653f918cf7956d2fcd20a940caf3'
$expectedNode = 'v24.16.0'

function Invoke-NativeText {
    param(
        [Parameter(Mandatory = $true)][string]$File,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$WorkingDirectory
    )

    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    $output = @()
    $exitCode = 0
    try {
        if ($WorkingDirectory) {
            Set-Location -LiteralPath $WorkingDirectory
        }
        $ErrorActionPreference = 'Continue'
        $output = @(& $File @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }

    if ($exitCode -ne 0) {
        throw ('{0} {1} failed with exit code {2}.{3}{4}' -f
            $File,
            ($Arguments -join ' '),
            $exitCode,
            [Environment]::NewLine,
            (($output | Out-String).Trim())
        )
    }

    return (($output | Out-String).Trim())
}

function Invoke-NativeCode {
    param(
        [Parameter(Mandatory = $true)][string]$File,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$WorkingDirectory
    )

    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    $exitCode = 0
    try {
        if ($WorkingDirectory) {
            Set-Location -LiteralPath $WorkingDirectory
        }
        $ErrorActionPreference = 'Continue'
        & $File @Arguments
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }

    return [int]$exitCode
}

foreach ($command in @('git', 'node', 'npm')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw ("Required command '{0}' is unavailable." -f $command)
    }
}

if (-not $WorkspaceRoot) {
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $WorkspaceRoot = Join-Path $env:LOCALAPPDATA 'JV-Web-Playable'
    }
    elseif (-not [string]::IsNullOrWhiteSpace($env:TEMP)) {
        $WorkspaceRoot = Join-Path $env:TEMP 'JV-Web-Playable'
    }
    else {
        throw 'Unable to resolve the playable workspace root.'
    }
}

$WorkspaceRoot = [System.IO.Path]::GetFullPath($WorkspaceRoot)
$evidencePath = Join-Path $WorkspaceRoot 'evidence'
if (-not (Test-Path -LiteralPath $evidencePath -PathType Container)) {
    throw 'No validated playable evidence directory exists. Run Launch-JvWebPlayable.ps1 once.'
}

$receiptFile = Get-ChildItem -LiteralPath $evidencePath -Filter 'playable-*.json' -File |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 1
if ($null -eq $receiptFile) {
    throw 'No successful playable receipt exists. Run Launch-JvWebPlayable.ps1 once.'
}

try {
    $receipt = Get-Content -Raw -LiteralPath $receiptFile.FullName | ConvertFrom-Json
}
catch {
    throw ('Unable to parse playable receipt {0}: {1}' -f $receiptFile.FullName, $_.Exception.Message)
}

if ($receipt.schema -ne 'JV_WEB_PLAYABLE_RECOVERY_V1') {
    throw ('Unsupported playable receipt schema in {0}.' -f $receiptFile.FullName)
}
if ($receipt.gate -ne 'PASS') {
    throw ('Playable receipt does not record gate PASS: {0}' -f $receiptFile.FullName)
}
if ($receipt.sourceCommit -ne $runtimeCommit) {
    throw ('Playable receipt source mismatch: {0} != {1}' -f $receipt.sourceCommit, $runtimeCommit)
}
if ([string]::IsNullOrWhiteSpace([string]$receipt.worktree)) {
    throw ('Playable receipt does not identify a worktree: {0}' -f $receiptFile.FullName)
}

$worktreePath = [System.IO.Path]::GetFullPath([string]$receipt.worktree)
if (-not (Test-Path -LiteralPath $worktreePath -PathType Container)) {
    throw ('Validated playable worktree is missing: {0}. Run Launch-JvWebPlayable.ps1 again.' -f $worktreePath)
}

$nodeVersion = Invoke-NativeText -File 'node' -Arguments @('--version')
$npmVersion = Invoke-NativeText -File 'npm' -Arguments @('--version')
if ($nodeVersion -ne $expectedNode) {
    throw ("Playable runtime requires exact Node {0}; received '{1}'." -f $expectedNode, $nodeVersion)
}
if ($npmVersion -notmatch '^11\.') {
    throw ("Playable runtime requires npm 11.x; received '{0}'." -f $npmVersion)
}

$head = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', 'HEAD')
$branch = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'branch', '--show-current')
$status = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'status', '--porcelain=v1', '--untracked-files=all')
if ($head -ne $runtimeCommit) {
    throw ('Playable worktree commit mismatch: {0} != {1}' -f $head, $runtimeCommit)
}
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw 'Playable worktree is detached. Run Launch-JvWebPlayable.ps1 to restore its validated branch identity.'
}
if (-not [string]::IsNullOrWhiteSpace($status)) {
    throw ('Playable worktree contains unexpected changes. Nothing was reset or deleted.{0}{1}' -f [Environment]::NewLine, $status)
}

$viteCommand = Join-Path $worktreePath 'node_modules\.bin\vite.cmd'
if (-not (Test-Path -LiteralPath $viteCommand -PathType Leaf)) {
    throw 'Validated dependencies are missing. Run Launch-JvWebPlayable.ps1 to revalidate the checkpoint.'
}

Write-Host 'JV WEB PLAYABLE RUN'
Write-Host ('Receipt:   {0}' -f $receiptFile.FullName)
Write-Host ('Worktree:  {0}' -f $worktreePath)
Write-Host ('Branch:    {0}' -f $branch)
Write-Host ('Commit:    {0}' -f $head)
Write-Host ('Node/npm:  {0} / {1}' -f $nodeVersion, $npmVersion)
Write-Host ''
Write-Host ('Starting validated JV Web at http://localhost:{0}' -f $Port)
Write-Host 'Keep this PowerShell window open. Press Ctrl+C to stop the server.'
Write-Host ''

$devCode = Invoke-NativeCode -File 'npm' -Arguments @('run', 'dev', '--', '--host', '0.0.0.0', '--port', $Port.ToString(), '--strictPort') -WorkingDirectory $worktreePath
exit $devCode
