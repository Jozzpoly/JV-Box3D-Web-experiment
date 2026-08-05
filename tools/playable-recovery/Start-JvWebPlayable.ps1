[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 5173,
    [switch]$ValidateOnly,
    [string]$WorkspaceRoot
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

function Invoke-NativeQuietCode {
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
        & $File @Arguments 1>$null 2>$null
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }

    return [int]$exitCode
}

function Invoke-NativeCapturedCode {
    param(
        [Parameter(Mandatory = $true)][string]$File,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$LogPath
    )

    @(
        ('COMMAND: {0} {1}' -f $File, ($Arguments -join ' ')),
        ('WORKDIR: {0}' -f $WorkingDirectory),
        ('STARTED: {0}' -f (Get-Date).ToUniversalTime().ToString('o')),
        ''
    ) | Out-File -LiteralPath $LogPath -Encoding utf8

    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    $output = @()
    $exitCode = 0
    try {
        Set-Location -LiteralPath $WorkingDirectory
        $ErrorActionPreference = 'Continue'
        $output = @(& $File @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }

    $output | ForEach-Object { Write-Host $_ }
    $output | Out-File -LiteralPath $LogPath -Encoding utf8 -Append
    @(
        '',
        ('EXIT_CODE: {0}' -f $exitCode),
        ('FINISHED: {0}' -f (Get-Date).ToUniversalTime().ToString('o'))
    ) | Out-File -LiteralPath $LogPath -Encoding utf8 -Append

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

if (-not $WorkspaceRoot) {
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $WorkspaceRoot = Join-Path $env:LOCALAPPDATA 'JV-Web-Playable'
    }
    elseif (-not [string]::IsNullOrWhiteSpace($env:TEMP)) {
        $WorkspaceRoot = Join-Path $env:TEMP 'JV-Web-Playable'
    }
    else {
        throw 'Unable to resolve a short per-user workspace path.'
    }
}

$workspaceRootNormalized = ConvertTo-NormalizedFullPath -Path $WorkspaceRoot
$repositoryPrefix = $repositoryRoot + '/'
if (
    [string]::Equals($workspaceRootNormalized, $repositoryRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    $workspaceRootNormalized.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)
) {
    throw 'WorkspaceRoot must be outside the active repository.'
}

$workspaceRootNative = [System.IO.Path]::GetFullPath($WorkspaceRoot)
$evidencePath = Join-Path $workspaceRootNative 'evidence'
New-Item -ItemType Directory -Path $workspaceRootNative -Force | Out-Null
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null

Write-Host 'JV WEB PLAYABLE RECOVERY'
Write-Host ('Active branch:   {0}' -f $activeBranch)
Write-Host ('Active HEAD:     {0}' -f $activeHead)
Write-Host ('Active worktree: {0}' -f $activeState)
Write-Host ('Runtime commit:  {0}' -f $runtimeCommit)
Write-Host ('Node/npm:        {0} / {1}' -f $nodeVersion, $npmVersion)
Write-Host ('Workspace root:  {0}' -f $workspaceRootNative)
Write-Host ''

$fetchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $runtimeBranch) -WorkingDirectory $repositoryRoot
if ($fetchCode -ne 0) {
    throw 'Unable to fetch the pinned playable runtime branch.'
}

$commitCheckCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $repositoryRoot, 'cat-file', '-e', ('{0}^{{commit}}' -f $runtimeCommit)) -WorkingDirectory $repositoryRoot
if ($commitCheckCode -ne 0) {
    throw ('Pinned runtime commit {0} is unavailable locally.' -f $runtimeCommit)
}

$trackedText = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'ls-tree', '-r', '--name-only', $runtimeCommit)
$trackedPaths = @($trackedText -split "`r?`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$longestTrackedPath = $trackedPaths | Sort-Object { $_.Length } -Descending | Select-Object -First 1

$worktreePath = $null
$attemptLogs = New-Object 'System.Collections.Generic.List[string]'
for ($attempt = 1; $attempt -le 6; $attempt++) {
    $name = if ($attempt -eq 1) { 'runtime-d6aa218' } else { 'runtime-d6aa218-{0}' -f $attempt }
    $candidate = Join-Path $workspaceRootNative $name

    if (Test-Path -LiteralPath $candidate) {
        $candidateGitCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $candidate, 'rev-parse', '--is-inside-work-tree')
        if ($candidateGitCode -eq 0) {
            $candidateHead = Invoke-NativeText -File 'git' -Arguments @('-C', $candidate, 'rev-parse', 'HEAD')
            $candidateStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $candidate, 'status', '--porcelain=v1', '--untracked-files=all')
            if ($candidateHead -eq $runtimeCommit -and [string]::IsNullOrWhiteSpace($candidateStatus)) {
                $worktreePath = $candidate
                Write-Host ('Reusing validated worktree candidate: {0}' -f $candidate)
                break
            }
        }

        Write-Host ('Skipping existing incomplete or unexpected path without deleting it: {0}' -f $candidate)
        continue
    }

    $projectedLongestPath = if ($longestTrackedPath) { (Join-Path $candidate $longestTrackedPath).Length } else { $candidate.Length }
    Write-Host ('Creating isolated worktree candidate: {0}' -f $candidate)
    Write-Host ('Projected longest tracked path: {0} characters' -f $projectedLongestPath)

    $logPath = Join-Path $evidencePath ('worktree-add-{0}-{1}.log' -f $attempt, (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
    $attemptLogs.Add($logPath)
    $worktreeCode = Invoke-NativeCapturedCode -File 'git' -Arguments @('-c', 'core.longpaths=true', '-C', $repositoryRoot, 'worktree', 'add', '--detach', $candidate, $runtimeCommit) -WorkingDirectory $repositoryRoot -LogPath $logPath
    if ($worktreeCode -eq 0) {
        $worktreePath = $candidate
        break
    }

    Write-Host ('Worktree candidate failed; full Git log preserved at: {0}' -f $logPath)
    Write-Host 'Trying the next untouched candidate path.'
    Write-Host ''
}

if (-not $worktreePath) {
    throw ('Unable to create or reuse an isolated playable worktree after six safe attempts. No existing path was deleted. Logs:{0}{1}' -f
        [Environment]::NewLine,
        (($attemptLogs | ForEach-Object { ' - {0}' -f $_ }) -join [Environment]::NewLine)
    )
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
$gateLog = Join-Path $evidencePath ('foundation-gate-{0}.log' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
$gateCode = Invoke-NativeCapturedCode -File $powerShellExecutable -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $gateScript) -WorkingDirectory $worktreePath -LogPath $gateLog
if ($gateCode -ne 0) {
    throw ('Playable runtime gate failed with exit code {0}. Full output: {1}. The active repository was not modified.' -f $gateCode, $gateLog)
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
    gateLog = $gateLog
}
$receiptFile = Join-Path $evidencePath ('playable-{0}.json' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
$receipt | ConvertTo-Json -Depth 6 | Out-File -LiteralPath $receiptFile -Encoding utf8

Write-Host ''
Write-Host 'JV WEB PLAYABLE RECOVERY: VALIDATED'
Write-Host ('Worktree: {0}' -f $expectedWorktree)
Write-Host ('Gate log: {0}' -f $gateLog)
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
