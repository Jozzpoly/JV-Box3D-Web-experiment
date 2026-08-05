[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 5174,
    [switch]$ValidateOnly,
    [string]$WorkspaceRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$targetCommit = 'e263e3e05ea21e74585d74829136e3defbd67813'
$remoteBranch = 'candidate/jv-web-render-host-r1'
$localBranchStem = 'local/jv-web-render-host-r1'
$pullRequest = 23
$expectedNode = 'v24.16.0'
$expectedNpm = '11.17.0'
$receiptSchema = 'JV_WEB_CANDIDATE_RENDER_HOST_R1_V1'

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

$repositoryCandidate = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$repositoryRootText = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryCandidate, 'rev-parse', '--show-toplevel')
$repositoryRoot = [System.IO.Path]::GetFullPath($repositoryRootText)
$separator = [System.IO.Path]::DirectorySeparatorChar
if (-not [string]::Equals($repositoryCandidate.TrimEnd($separator), $repositoryRoot.TrimEnd($separator), [System.StringComparison]::OrdinalIgnoreCase)) {
    throw ('Unexpected repository root: {0}' -f $repositoryRoot)
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
    throw ("Candidate R1 requires exact Node {0}; received '{1}'." -f $expectedNode, $nodeVersion)
}
if ($npmVersion -ne $expectedNpm) {
    throw ("Candidate R1 requires exact npm {0}; received '{1}'." -f $expectedNpm, $npmVersion)
}

if (-not $WorkspaceRoot) {
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $WorkspaceRoot = Join-Path $env:LOCALAPPDATA 'JV-Web-Candidates\render-host-r1'
    }
    elseif (-not [string]::IsNullOrWhiteSpace($env:TEMP)) {
        $WorkspaceRoot = Join-Path $env:TEMP 'JV-Web-Candidates\render-host-r1'
    }
    else {
        throw 'Unable to resolve a short per-user candidate workspace.'
    }
}

$WorkspaceRoot = [System.IO.Path]::GetFullPath($WorkspaceRoot)
$repositoryPrefix = $repositoryRoot.TrimEnd($separator) + $separator
if (
    [string]::Equals($WorkspaceRoot.TrimEnd($separator), $repositoryRoot.TrimEnd($separator), [System.StringComparison]::OrdinalIgnoreCase) -or
    $WorkspaceRoot.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)
) {
    throw 'Candidate workspace must be outside the active repository.'
}

$evidencePath = Join-Path $WorkspaceRoot 'evidence'
New-Item -ItemType Directory -Path $WorkspaceRoot -Force | Out-Null
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null

Write-Host 'JV WEB CANDIDATE R1 — RENDER HOST'
Write-Host ('Active branch:   {0}' -f $activeBranch)
Write-Host ('Active HEAD:     {0}' -f $activeHead)
Write-Host ('Active worktree: {0}' -f $activeState)
Write-Host ('Candidate:       {0}' -f $remoteBranch)
Write-Host ('Target commit:   {0}' -f $targetCommit)
Write-Host ('PR:              #{0}' -f $pullRequest)
Write-Host ('Node/npm:        {0} / {1}' -f $nodeVersion, $npmVersion)
Write-Host ('Workspace root:  {0}' -f $WorkspaceRoot)
Write-Host ''

$remoteTrackingRef = 'refs/remotes/origin/{0}' -f $remoteBranch
$fetchSpec = 'refs/heads/{0}:{1}' -f $remoteBranch, $remoteTrackingRef
$fetchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $fetchSpec) -WorkingDirectory $repositoryRoot
if ($fetchCode -ne 0) {
    throw 'Unable to fetch the pinned candidate branch.'
}

$remoteCommit = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'rev-parse', ('{0}^{{commit}}' -f $remoteTrackingRef))
if ($remoteCommit -ne $targetCommit) {
    throw ('Remote candidate moved: {0} != {1}. Validation stopped.' -f $remoteCommit, $targetCommit)
}

$selectedWorktree = $null
$selectedLocalBranch = $null
$worktreeLogs = New-Object 'System.Collections.Generic.List[string]'
for ($attempt = 1; $attempt -le 4; $attempt++) {
    $suffix = if ($attempt -eq 1) { '' } else { '-{0}' -f $attempt }
    $localBranch = '{0}{1}' -f $localBranchStem, $suffix
    $branchRef = 'refs/heads/{0}' -f $localBranch
    $worktreePath = Join-Path $WorkspaceRoot ('worktree{0}' -f $suffix)

    $branchExists = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $repositoryRoot, 'show-ref', '--verify', '--quiet', $branchRef) -WorkingDirectory $repositoryRoot
    if ($branchExists -eq 0) {
        $branchCommit = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'rev-parse', ('{0}^{{commit}}' -f $branchRef))
        if ($branchCommit -ne $targetCommit) {
            Write-Host ('Skipping local branch with unexpected commit: {0}' -f $localBranch)
            continue
        }
    }
    else {
        $branchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'branch', $localBranch, $targetCommit) -WorkingDirectory $repositoryRoot
        if ($branchCode -ne 0) {
            throw ('Unable to create local candidate branch {0}.' -f $localBranch)
        }
    }

    if (Test-Path -LiteralPath $worktreePath) {
        $isWorktree = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', '--is-inside-work-tree')
        if ($isWorktree -ne 0) {
            Write-Host ('Skipping existing non-worktree path without deleting it: {0}' -f $worktreePath)
            continue
        }

        $candidateHead = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', 'HEAD')
        $candidateStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'status', '--porcelain=v1', '--untracked-files=all')
        if ($candidateHead -ne $targetCommit -or -not [string]::IsNullOrWhiteSpace($candidateStatus)) {
            Write-Host ('Skipping changed or unexpected worktree without deleting it: {0}' -f $worktreePath)
            continue
        }

        $candidateBranch = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'branch', '--show-current')
        if ([string]::IsNullOrWhiteSpace($candidateBranch)) {
            $switchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $worktreePath, 'switch', $localBranch) -WorkingDirectory $worktreePath
            if ($switchCode -ne 0) {
                throw ('Unable to attach candidate worktree to {0}.' -f $localBranch)
            }
            $candidateBranch = $localBranch
        }
        if ($candidateBranch -ne $localBranch) {
            Write-Host ('Skipping worktree attached to another branch: {0}' -f $candidateBranch)
            continue
        }

        $selectedWorktree = $worktreePath
        $selectedLocalBranch = $localBranch
        break
    }

    $worktreeLog = Join-Path $evidencePath ('worktree-add-{0}-{1}.log' -f $attempt, (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
    $worktreeLogs.Add($worktreeLog)
    Write-Host ('Creating exact candidate worktree: {0}' -f $worktreePath)
    $addCode = Invoke-NativeCapturedCode -File 'git' -Arguments @('-c', 'core.longpaths=true', '-C', $repositoryRoot, 'worktree', 'add', $worktreePath, $localBranch) -WorkingDirectory $repositoryRoot -LogPath $worktreeLog
    if ($addCode -eq 0) {
        $selectedWorktree = $worktreePath
        $selectedLocalBranch = $localBranch
        break
    }

    Write-Host ('Candidate worktree creation failed; log: {0}' -f $worktreeLog)
    Write-Host 'Trying the next untouched candidate path.'
}

if (-not $selectedWorktree -or -not $selectedLocalBranch) {
    throw ('Unable to prepare candidate worktree after four non-destructive attempts. Logs:{0}{1}' -f
        [Environment]::NewLine,
        (($worktreeLogs | ForEach-Object { ' - {0}' -f $_ }) -join [Environment]::NewLine)
    )
}

$headBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'rev-parse', 'HEAD')
$branchBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'branch', '--show-current')
$statusBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'status', '--porcelain=v1', '--untracked-files=all')
if ($headBefore -ne $targetCommit -or $branchBefore -ne $selectedLocalBranch -or -not [string]::IsNullOrWhiteSpace($statusBefore)) {
    throw 'Candidate worktree identity or cleanliness check failed before the gate.'
}

$gateScript = Join-Path $selectedWorktree 'tools\run-demonstrator-foundation-gate.ps1'
if (-not (Test-Path -LiteralPath $gateScript -PathType Leaf)) {
    throw ('Candidate gate script is missing: {0}' -f $gateScript)
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

$gateLog = Join-Path $evidencePath ('foundation-gate-{0}.log' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
Write-Host ''
Write-Host 'Running the exact full repository gate for Candidate R1...'
$gateCode = Invoke-NativeCapturedCode -File $powerShellExecutable -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $gateScript) -WorkingDirectory $selectedWorktree -LogPath $gateLog
if ($gateCode -ne 0) {
    throw ('Candidate R1 gate failed with exit code {0}. Full log: {1}' -f $gateCode, $gateLog)
}
$gateLogSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $gateLog).Hash.ToLowerInvariant()

$headAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'rev-parse', 'HEAD')
$branchAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'branch', '--show-current')
$statusAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'status', '--porcelain=v1', '--untracked-files=all')
if ($headAfter -ne $headBefore -or $branchAfter -ne $branchBefore -or -not [string]::IsNullOrWhiteSpace($statusAfter)) {
    throw ('Candidate source identity changed during the gate. Before {0}/{1}; after {2}/{3}. Status:{4}{5}' -f
        $branchBefore,
        $headBefore,
        $branchAfter,
        $headAfter,
        [Environment]::NewLine,
        $statusAfter
    )
}

$receipt = [ordered]@{
    schema = $receiptSchema
    validatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    pullRequest = $pullRequest
    remoteBranch = $remoteBranch
    sourceCommit = $targetCommit
    localBranch = $selectedLocalBranch
    worktree = [System.IO.Path]::GetFullPath($selectedWorktree)
    toolchain = [ordered]@{
        node = $nodeVersion
        npm = $npmVersion
        powerShell = $PSVersionTable.PSVersion.ToString()
    }
    activeControlPlane = [ordered]@{
        root = $repositoryRoot
        branch = $activeBranch
        head = $activeHead
        state = $activeState
    }
    gate = 'PASS'
    gateLog = $gateLog
    gateLogSha256 = $gateLogSha256
    sourceIdentityPreserved = $true
    browserObservation = 'PENDING_OWNER'
}
$receiptFile = Join-Path $evidencePath ('candidate-render-host-r1-{0}.json' -f (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ'))
$receipt | ConvertTo-Json -Depth 6 | Out-File -LiteralPath $receiptFile -Encoding utf8

Write-Host ''
Write-Host 'JV WEB CANDIDATE R1: SOURCE/PACKAGE GATE PASS'
Write-Host ('Worktree:       {0}' -f $selectedWorktree)
Write-Host ('Branch:         {0}' -f $selectedLocalBranch)
Write-Host ('Commit:         {0}' -f $targetCommit)
Write-Host ('Gate log:       {0}' -f $gateLog)
Write-Host ('Gate log SHA256:{0}' -f $gateLogSha256)
Write-Host ('Receipt:        {0}' -f $receiptFile)

if ($ValidateOnly) {
    Write-Host 'Browser server was not started because -ValidateOnly was supplied.'
    exit 0
}

Write-Host ''
Write-Host ('Starting Candidate R1 at http://localhost:{0}' -f $Port)
Write-Host 'The owner-accepted baseline remains available separately on port 5173.'
Write-Host 'Keep this PowerShell window open. Press Ctrl+C to stop Candidate R1.'
Write-Host ''

$devCode = Invoke-NativeCode -File 'npm' -Arguments @('run', 'dev', '--', '--host', '0.0.0.0', '--port', $Port.ToString(), '--strictPort') -WorkingDirectory $selectedWorktree
exit $devCode
