[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 5173,
    [switch]$ValidateOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$runtimeCommit = 'd6aa218064c2653f918cf7956d2fcd20a940caf3'
$runtimeBranch = 'agent/jv-web-playable-runtime'
$expectedNode = 'v24.16.0'
$receiptRelativePath = 'public/receipts/jv_m6_factory_receipt.json'

function ConvertTo-NormalizedFullPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $slashPath = $fullPath -replace '\\', '/'
    return ($slashPath -replace '/+$', '')
}

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

$repositoryCandidate = ConvertTo-NormalizedFullPath -Path (Join-Path $PSScriptRoot '..\..')
$repositoryRootText = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryCandidate, 'rev-parse', '--show-toplevel')
$repositoryRoot = ConvertTo-NormalizedFullPath -Path $repositoryRootText
if (-not [string]::Equals($repositoryCandidate, $repositoryRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw ("Recovery operator must run from the canonical repository. Git reported '{0}'." -f $repositoryRoot)
}

$origin = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'remote', 'get-url', 'origin')
if ($origin -notmatch '([/:])Jozzpoly/JV-Box3D-Web-experiment(\.git)?$') {
    throw ("Unexpected origin '{0}'." -f $origin)
}

$activeBranch = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'branch', '--show-current')
$activeHead = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'rev-parse', 'HEAD')
$activeStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'status', '--porcelain=v1', '--untracked-files=all')
$activeState = if ([string]::IsNullOrWhiteSpace($activeStatus)) { 'clean' } else { 'dirty but untouched' }

$nodeVersion = Invoke-NativeText -File 'node' -Arguments @('--version')
$npmVersion = Invoke-NativeText -File 'npm' -Arguments @('--version')
if ($nodeVersion -ne $expectedNode) {
    throw ("Playable recovery requires exact Node {0}; received '{1}'." -f $expectedNode, $nodeVersion)
}
if ($npmVersion -notmatch '^11\.') {
    throw ("Playable recovery requires npm 11.x; received '{0}'." -f $npmVersion)
}

Write-Host 'JV WEB PLAYABLE RECOVERY'
Write-Host ('Active branch:   {0}' -f $activeBranch)
Write-Host ('Active HEAD:     {0}' -f $activeHead)
Write-Host ('Active worktree: {0}' -f $activeState)
Write-Host ('Runtime commit:  {0}' -f $runtimeCommit)
Write-Host ('Node/npm:        {0} / {1}' -f $nodeVersion, $npmVersion)
Write-Host ''

$fetchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $runtimeBranch) -WorkingDirectory $repositoryRoot
if ($fetchCode -ne 0) {
    throw 'Unable to fetch the pinned playable runtime branch.'
}

$commitCheckCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'cat-file', '-e', ('{0}^{{commit}}' -f $runtimeCommit)) -WorkingDirectory $repositoryRoot
if ($commitCheckCode -ne 0) {
    throw ('Pinned runtime commit {0} is unavailable locally.' -f $runtimeCommit)
}

$playableRoot = Join-Path (Split-Path -Parent $repositoryRoot) '_JV_WEB_PLAYABLE'
$worktreePath = Join-Path $playableRoot 'runtime-d6aa218'
$evidencePath = Join-Path $playableRoot 'evidence'
New-Item -ItemType Directory -Path $playableRoot -Force | Out-Null
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null

if (-not (Test-Path -LiteralPath $worktreePath)) {
    $worktreeCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'worktree', 'add', '--detach', $worktreePath, $runtimeCommit) -WorkingDirectory $repositoryRoot
    if ($worktreeCode -ne 0) {
        throw 'Unable to create the isolated playable worktree.'
    }
}

$resolvedWorktreeText = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', '--show-toplevel')
$resolvedWorktree = ConvertTo-NormalizedFullPath -Path $resolvedWorktreeText
$expectedWorktree = ConvertTo-NormalizedFullPath -Path $worktreePath
if (-not [string]::Equals($resolvedWorktree, $expectedWorktree, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw ("Existing playable path is not the expected Git worktree: '{0}'." -f $worktreePath)
}

$worktreeHead = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', 'HEAD')
if ($worktreeHead -ne $runtimeCommit) {
    throw ("Playable worktree points to {0}, expected {1}. Nothing was reset or replaced." -f $worktreeHead, $runtimeCommit)
}

$worktreeStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'status', '--porcelain=v1', '--untracked-files=all')
if (-not [string]::IsNullOrWhiteSpace($worktreeStatus)) {
    throw ("Playable worktree contains unexpected changes. Nothing was reset or deleted.{0}{1}" -f [Environment]::NewLine, $worktreeStatus)
}

$receiptPath = Join-Path $worktreePath $receiptRelativePath
if (-not (Test-Path -LiteralPath $receiptPath -PathType Leaf)) {
    throw ('Pinned receipt is missing from the playable worktree: {0}' -f $receiptRelativePath)
}

$expectedReceipt = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', ('HEAD:{0}' -f $receiptRelativePath))
$actualReceipt = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'hash-object', '--no-filters', $receiptPath)
if ($expectedReceipt -ne $actualReceipt) {
    Write-Host 'Restoring the byte-pinned receipt inside the isolated playable worktree...'
    Remove-Item -LiteralPath $receiptPath -Force
    $restoreCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $worktreePath, 'restore', '--source=HEAD', '--worktree', '--', $receiptRelativePath) -WorkingDirectory $worktreePath
    if ($restoreCode -ne 0) {
        throw 'Receipt restore failed inside the isolated playable worktree.'
    }
    $actualReceipt = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'hash-object', '--no-filters', $receiptPath)
}
if ($expectedReceipt -ne $actualReceipt) {
    throw ("Pinned receipt bytes differ from Git after restore. Expected {0}, received {1}." -f $expectedReceipt, $actualReceipt)
}

$powerShellExecutable = if ($PSVersionTable.PSEdition -eq 'Core') {
    Join-Path $PSHOME 'pwsh.exe'
}
else {
    Join-Path $PSHOME 'powershell.exe'
}
if (-not (Test-Path -LiteralPath $powerShellExecutable -PathType Leaf)) {
    throw 'Current PowerShell executable was not found.'
}

Write-Host ''
Write-Host 'Running the exact historical quality gate in the isolated playable worktree...'
$gateScript = Join-Path $worktreePath 'tools\run-demonstrator-foundation-gate.ps1'
$gateCode = Invoke-NativeCode -File $powerShellExecutable -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $gateScript) -WorkingDirectory $worktreePath
if ($gateCode -ne 0) {
    throw ('Playable runtime gate failed with exit code {0}. The active repository was not modified.' -f $gateCode)
}

$receipt = [ordered]@{
    schema = 'JV_WEB_PLAYABLE_RECOVERY_V1'
    validatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    sourceCommit = $runtimeCommit
    sourceBranch = $runtimeBranch
    worktree = $expectedWorktree
    activeRepository = [ordered]@{
        root = $repositoryRoot
        branch = $activeBranch
        head = $activeHead
        state = $activeState
    }
    toolchain = [ordered]@{
        node = $nodeVersion
        npm = $npmVersion
        powerShell = $PSVersionTable.PSVersion.ToString()
    }
    receiptBlob = $actualReceipt
    gate = 'PASS'
}
$receiptFile = Join-Path $evidencePath ('playable-{0}.json' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
$receipt | ConvertTo-Json -Depth 6 | Out-File -LiteralPath $receiptFile -Encoding utf8

Write-Host ''
Write-Host 'JV WEB PLAYABLE RECOVERY: VALIDATED'
Write-Host ('Worktree: {0}' -f $expectedWorktree)
Write-Host ('Receipt:  {0}' -f $receiptFile)

if ($ValidateOnly) {
    Write-Host 'Server was not started because -ValidateOnly was supplied.'
    exit 0
}

Write-Host ''
Write-Host ('Starting JV Web at http://localhost:{0}' -f $Port)
Write-Host 'Keep this PowerShell window open while playing. Press Ctrl+C to stop the server.'
Write-Host ''

$devCode = Invoke-NativeCode -File 'npm' -Arguments @('run', 'dev', '--', '--host', '0.0.0.0', '--port', $Port.ToString(), '--strictPort') -WorkingDirectory $worktreePath
exit $devCode
