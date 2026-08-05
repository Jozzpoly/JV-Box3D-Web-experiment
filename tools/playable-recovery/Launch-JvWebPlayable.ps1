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
$runtimeRemoteBranch = 'agent/jv-web-playable-runtime'

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

foreach ($command in @('git', 'node', 'npm')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw ("Required command '{0}' is unavailable." -f $command)
    }
}

$repositoryRoot = Invoke-NativeText -File 'git' -Arguments @('-C', (Join-Path $PSScriptRoot '..\..'), 'rev-parse', '--show-toplevel')
$repositoryRoot = [System.IO.Path]::GetFullPath($repositoryRoot)

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

$WorkspaceRoot = [System.IO.Path]::GetFullPath($WorkspaceRoot)
New-Item -ItemType Directory -Path $WorkspaceRoot -Force | Out-Null

Write-Host 'JV WEB PLAYABLE LAUNCH COMPATIBILITY'
Write-Host ('Repository:     {0}' -f $repositoryRoot)
Write-Host ('Workspace root: {0}' -f $WorkspaceRoot)
Write-Host ('Runtime commit: {0}' -f $runtimeCommit)
Write-Host ''

$fetchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $runtimeRemoteBranch) -WorkingDirectory $repositoryRoot
if ($fetchCode -ne 0) {
    throw 'Unable to fetch the pinned playable runtime branch.'
}

$selectedWorktree = $null
for ($attempt = 1; $attempt -le 6; $attempt++) {
    $suffix = if ($attempt -eq 1) { '' } else { '-{0}' -f $attempt }
    $worktreeName = 'runtime-d6aa218{0}' -f $suffix
    $candidate = Join-Path $WorkspaceRoot $worktreeName
    $localBranch = 'local/jv-web-playable-{0}' -f $worktreeName
    $branchRef = 'refs/heads/{0}' -f $localBranch

    $branchExists = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $repositoryRoot, 'show-ref', '--verify', '--quiet', $branchRef) -WorkingDirectory $repositoryRoot
    if ($branchExists -eq 0) {
        $branchCommit = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'rev-parse', ('{0}^{{commit}}' -f $branchRef))
        if ($branchCommit -ne $runtimeCommit) {
            Write-Host ('Skipping local branch with unexpected commit: {0}' -f $localBranch)
            continue
        }
    }
    else {
        $branchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $repositoryRoot, 'branch', $localBranch, $runtimeCommit) -WorkingDirectory $repositoryRoot
        if ($branchCode -ne 0) {
            throw ('Unable to create local compatibility branch {0}.' -f $localBranch)
        }
    }

    if (Test-Path -LiteralPath $candidate) {
        $isWorktree = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $candidate, 'rev-parse', '--is-inside-work-tree')
        if ($isWorktree -ne 0) {
            Write-Host ('Skipping existing non-worktree path without deleting it: {0}' -f $candidate)
            continue
        }

        $candidateHead = Invoke-NativeText -File 'git' -Arguments @('-C', $candidate, 'rev-parse', 'HEAD')
        $candidateStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $candidate, 'status', '--porcelain=v1', '--untracked-files=all')
        if ($candidateHead -ne $runtimeCommit -or -not [string]::IsNullOrWhiteSpace($candidateStatus)) {
            Write-Host ('Skipping changed or unexpected worktree without deleting it: {0}' -f $candidate)
            continue
        }

        $candidateBranch = Invoke-NativeText -File 'git' -Arguments @('-C', $candidate, 'branch', '--show-current')
        if ([string]::IsNullOrWhiteSpace($candidateBranch)) {
            Write-Host ('Attaching existing exact worktree to local branch: {0}' -f $localBranch)
            $switchCode = Invoke-NativeCode -File 'git' -Arguments @('-C', $candidate, 'switch', $localBranch) -WorkingDirectory $candidate
            if ($switchCode -ne 0) {
                throw ('Unable to attach the existing playable worktree to {0}.' -f $localBranch)
            }
        }

        $selectedWorktree = $candidate
        break
    }

    Write-Host ('Creating attached exact worktree: {0}' -f $candidate)
    $addCode = Invoke-NativeCode -File 'git' -Arguments @('-c', 'core.longpaths=true', '-C', $repositoryRoot, 'worktree', 'add', $candidate, $localBranch) -WorkingDirectory $repositoryRoot
    if ($addCode -eq 0) {
        $selectedWorktree = $candidate
        break
    }

    Write-Host 'This candidate failed; trying the next untouched path.'
}

if (-not $selectedWorktree) {
    throw 'Unable to prepare an attached exact playable worktree after six non-destructive attempts.'
}

$selectedHead = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'rev-parse', 'HEAD')
$selectedBranch = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'branch', '--show-current')
$selectedStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'status', '--porcelain=v1', '--untracked-files=all')
if ($selectedHead -ne $runtimeCommit) {
    throw ('Prepared worktree has unexpected commit {0}.' -f $selectedHead)
}
if ([string]::IsNullOrWhiteSpace($selectedBranch)) {
    throw 'Prepared worktree is still detached; the historical gate would be invalid.'
}
if (-not [string]::IsNullOrWhiteSpace($selectedStatus)) {
    throw 'Prepared worktree is not clean.'
}

Write-Host ('Prepared worktree: {0}' -f $selectedWorktree)
Write-Host ('Gate branch:      {0}' -f $selectedBranch)
Write-Host ''

$operatorPath = Join-Path $repositoryRoot 'tools\playable-recovery\Start-JvWebPlayable.ps1'
$powerShellExecutable = if ($PSVersionTable.PSEdition -eq 'Core') {
    Join-Path $PSHOME 'pwsh.exe'
}
else {
    Join-Path $PSHOME 'powershell.exe'
}

$operatorArguments = @(
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    $operatorPath,
    '-Port',
    $Port.ToString(),
    '-WorkspaceRoot',
    $WorkspaceRoot
)
if ($ValidateOnly) {
    $operatorArguments += '-ValidateOnly'
}

& $powerShellExecutable @operatorArguments
exit $LASTEXITCODE
