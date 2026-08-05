[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 5175,
    [switch]$ValidateOnly,
    [string]$WorkspaceRoot,
    [string]$ScanRoot = 'C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$targetCommit = '5fbbb83449722fda7b4c45e1fd7c3dc6a2a14052'
$remoteBranch = 'product/jv-web-car-map-scan'
$localBranchStem = 'local/jv-web-car-map-scan'
$expectedNode = 'v24.16.0'
$expectedNpm = '11.17.0'
$receiptSchema = 'JV_WEB_CAR_MAP_SCAN_PRODUCT_V1'

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
        [string]$WorkingDirectory,
        [switch]$Quiet
    )

    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    $exitCode = 0
    try {
        if ($WorkingDirectory) {
            Set-Location -LiteralPath $WorkingDirectory
        }
        $ErrorActionPreference = 'Continue'
        if ($Quiet) {
            & $File @Arguments 1>$null 2>$null
        }
        else {
            & $File @Arguments
        }
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
$repositoryRoot = [System.IO.Path]::GetFullPath(
    (Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryCandidate, 'rev-parse', '--show-toplevel'))
)
$separator = [System.IO.Path]::DirectorySeparatorChar
if (-not [string]::Equals(
    $repositoryCandidate.TrimEnd($separator),
    $repositoryRoot.TrimEnd($separator),
    [System.StringComparison]::OrdinalIgnoreCase
)) {
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
    throw ("JV car/map/scan requires exact Node {0}; received '{1}'." -f $expectedNode, $nodeVersion)
}
if ($npmVersion -ne $expectedNpm) {
    throw ("JV car/map/scan requires exact npm {0}; received '{1}'." -f $expectedNpm, $npmVersion)
}

if (-not $WorkspaceRoot) {
    if (-not [string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $WorkspaceRoot = Join-Path $env:LOCALAPPDATA 'JV-Web-Products\car-map-scan'
    }
    elseif (-not [string]::IsNullOrWhiteSpace($env:TEMP)) {
        $WorkspaceRoot = Join-Path $env:TEMP 'JV-Web-Products\car-map-scan'
    }
    else {
        throw 'Unable to resolve a short per-user product workspace.'
    }
}

$WorkspaceRoot = [System.IO.Path]::GetFullPath($WorkspaceRoot)
$repositoryPrefix = $repositoryRoot.TrimEnd($separator) + $separator
if (
    [string]::Equals(
        $WorkspaceRoot.TrimEnd($separator),
        $repositoryRoot.TrimEnd($separator),
        [System.StringComparison]::OrdinalIgnoreCase
    ) -or
    $WorkspaceRoot.StartsWith(
        $repositoryPrefix,
        [System.StringComparison]::OrdinalIgnoreCase
    )
) {
    throw 'Product workspace must be outside the active repository.'
}

$evidencePath = Join-Path $WorkspaceRoot 'evidence'
New-Item -ItemType Directory -Path $WorkspaceRoot -Force | Out-Null
New-Item -ItemType Directory -Path $evidencePath -Force | Out-Null

Write-Host 'JV WEB PRODUCT — CAR + E2R MAP + JSPREV2 SCAN'
Write-Host ('Active branch:   {0}' -f $activeBranch)
Write-Host ('Active HEAD:     {0}' -f $activeHead)
Write-Host ('Active worktree: {0}' -f $activeState)
Write-Host ('Product branch:  {0}' -f $remoteBranch)
Write-Host ('Target commit:   {0}' -f $targetCommit)
Write-Host ('Node/npm:        {0} / {1}' -f $nodeVersion, $npmVersion)
Write-Host ('Workspace root:  {0}' -f $WorkspaceRoot)
Write-Host ''

$remoteTrackingRef = 'refs/remotes/origin/{0}' -f $remoteBranch
$fetchSpec = 'refs/heads/{0}:{1}' -f $remoteBranch, $remoteTrackingRef
$fetchCode = Invoke-NativeCode -File 'git' -Arguments @(
    '-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $fetchSpec
) -WorkingDirectory $repositoryRoot
if ($fetchCode -ne 0) {
    throw 'Unable to fetch the pinned product branch.'
}

$remoteCommit = Invoke-NativeText -File 'git' -Arguments @(
    '-C', $repositoryRoot, 'rev-parse', ('{0}^{{commit}}' -f $remoteTrackingRef)
)
if ($remoteCommit -ne $targetCommit) {
    throw ('Remote product moved: {0} != {1}. Validation stopped.' -f $remoteCommit, $targetCommit)
}

$selectedWorktree = $null
$selectedLocalBranch = $null
$worktreeLogs = New-Object 'System.Collections.Generic.List[string]'
for ($attempt = 1; $attempt -le 6; $attempt++) {
    $suffix = if ($attempt -eq 1) { '' } else { '-{0}' -f $attempt }
    $localBranch = '{0}{1}' -f $localBranchStem, $suffix
    $branchRef = 'refs/heads/{0}' -f $localBranch
    $worktreePath = Join-Path $WorkspaceRoot ('worktree{0}' -f $suffix)

    $branchExists = Invoke-NativeCode -File 'git' -Arguments @(
        '-C', $repositoryRoot, 'show-ref', '--verify', '--quiet', $branchRef
    ) -WorkingDirectory $repositoryRoot -Quiet

    if ($branchExists -eq 0) {
        $branchCommit = Invoke-NativeText -File 'git' -Arguments @(
            '-C', $repositoryRoot, 'rev-parse', ('{0}^{{commit}}' -f $branchRef)
        )
        if ($branchCommit -ne $targetCommit) {
            Write-Host ('Skipping local branch with unexpected commit: {0}' -f $localBranch)
            continue
        }
    }
    else {
        $branchCode = Invoke-NativeCode -File 'git' -Arguments @(
            '-C', $repositoryRoot, 'branch', $localBranch, $targetCommit
        ) -WorkingDirectory $repositoryRoot
        if ($branchCode -ne 0) {
            throw ('Unable to create local product branch {0}.' -f $localBranch)
        }
    }

    if (Test-Path -LiteralPath $worktreePath) {
        $isWorktree = Invoke-NativeCode -File 'git' -Arguments @(
            '-C', $worktreePath, 'rev-parse', '--is-inside-work-tree'
        ) -WorkingDirectory $repositoryRoot -Quiet
        if ($isWorktree -ne 0) {
            Write-Host ('Skipping existing non-worktree path without deleting it: {0}' -f $worktreePath)
            continue
        }

        $candidateHead = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'rev-parse', 'HEAD')
        $candidateBranch = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'branch', '--show-current')
        $candidateStatus = Invoke-NativeText -File 'git' -Arguments @('-C', $worktreePath, 'status', '--porcelain=v1', '--untracked-files=all')
        if (
            $candidateHead -ne $targetCommit -or
            $candidateBranch -ne $localBranch -or
            -not [string]::IsNullOrWhiteSpace($candidateStatus)
        ) {
            Write-Host ('Skipping changed or unexpected worktree without deleting it: {0}' -f $worktreePath)
            continue
        }

        $selectedWorktree = $worktreePath
        $selectedLocalBranch = $localBranch
        break
    }

    $worktreeLog = Join-Path $evidencePath (
        'worktree-add-{0}-{1}.log' -f
        $attempt,
        (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
    )
    $worktreeLogs.Add($worktreeLog)
    Write-Host ('Creating exact product worktree: {0}' -f $worktreePath)
    $addCode = Invoke-NativeCapturedCode -File 'git' -Arguments @(
        '-c', 'core.longpaths=true', '-C', $repositoryRoot,
        'worktree', 'add', $worktreePath, $localBranch
    ) -WorkingDirectory $repositoryRoot -LogPath $worktreeLog
    if ($addCode -eq 0) {
        $selectedWorktree = $worktreePath
        $selectedLocalBranch = $localBranch
        break
    }

    Write-Host ('Worktree creation failed; preserved log: {0}' -f $worktreeLog)
}

if (-not $selectedWorktree -or -not $selectedLocalBranch) {
    throw ('Unable to prepare an untouched product worktree after six attempts. Logs:{0}{1}' -f
        [Environment]::NewLine,
        (($worktreeLogs | ForEach-Object { ' - {0}' -f $_ }) -join [Environment]::NewLine)
    )
}

$headBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'rev-parse', 'HEAD')
$branchBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'branch', '--show-current')
$statusBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'status', '--porcelain=v1', '--untracked-files=all')
if (
    $headBefore -ne $targetCommit -or
    $branchBefore -ne $selectedLocalBranch -or
    -not [string]::IsNullOrWhiteSpace($statusBefore)
) {
    throw 'Product worktree identity or cleanliness check failed before the gate.'
}

$gateScript = Join-Path $selectedWorktree 'tools\run-demonstrator-foundation-gate.ps1'
if (-not (Test-Path -LiteralPath $gateScript -PathType Leaf)) {
    throw ('Product gate script is missing: {0}' -f $gateScript)
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

$gateLog = Join-Path $evidencePath (
    'foundation-gate-{0}.log' -f
    (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
)
Write-Host ''
Write-Host 'Running the exact full repository gate. Output is emitted after the command completes...'
$gateCode = Invoke-NativeCapturedCode -File $powerShellExecutable -Arguments @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $gateScript
) -WorkingDirectory $selectedWorktree -LogPath $gateLog
if ($gateCode -ne 0) {
    throw ('JV car/map/scan gate failed with exit code {0}. Full log: {1}' -f $gateCode, $gateLog)
}
$gateLogSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $gateLog).Hash.ToLowerInvariant()

$headAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'rev-parse', 'HEAD')
$branchAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'branch', '--show-current')
$statusAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $selectedWorktree, 'status', '--porcelain=v1', '--untracked-files=all')
if (
    $headAfter -ne $headBefore -or
    $branchAfter -ne $branchBefore -or
    -not [string]::IsNullOrWhiteSpace($statusAfter)
) {
    throw ('Product source identity changed during the gate. Before {0}/{1}; after {2}/{3}.' -f
        $branchBefore,
        $headBefore,
        $branchAfter,
        $headAfter
    )
}

$selectorScript = Join-Path $selectedWorktree 'tools\product\find-jsprev2-pack.mjs'
if (-not (Test-Path -LiteralPath $selectorScript -PathType Leaf)) {
    throw ('JSPREV2 selector is missing: {0}' -f $selectorScript)
}

$selectorArguments = New-Object 'System.Collections.Generic.List[string]'
$selectorArguments.Add($selectorScript)
if (-not [string]::IsNullOrWhiteSpace($ScanRoot)) {
    $resolvedScanRoot = [System.IO.Path]::GetFullPath($ScanRoot)
    if (Test-Path -LiteralPath $resolvedScanRoot -PathType Container) {
        $selectorArguments.Add('--root')
        $selectorArguments.Add($resolvedScanRoot)
    }
}

Write-Host ''
Write-Host 'Selecting the exact final JSPREV2 pack (25 groups / 25 textures)...'
$selectionText = Invoke-NativeText -File 'node' -Arguments $selectorArguments.ToArray() -WorkingDirectory $selectedWorktree
try {
    $scanSelection = $selectionText | ConvertFrom-Json
}
catch {
    throw ('JSPREV2 selector did not return valid JSON:{0}{1}' -f
        [Environment]::NewLine,
        $selectionText
    )
}
if (
    $scanSelection.schema -ne 'JV_WEB_JSPREV2_PACK_SELECTION_V1' -or
    $scanSelection.status -ne 'PASS' -or
    [int]$scanSelection.groupCount -ne 25 -or
    [int]$scanSelection.textureCount -ne 25
) {
    throw 'JSPREV2 selector receipt failed the exact 25/25 contract.'
}

$scanPackPath = [System.IO.Path]::GetFullPath([string]$scanSelection.packDirectory)
if (-not (Test-Path -LiteralPath $scanPackPath -PathType Container)) {
    throw ('Selected JSPREV2 pack disappeared: {0}' -f $scanPackPath)
}
$env:JOZZ_SCAN_PREVIEW_PACK = $scanPackPath

$selectionFile = Join-Path $evidencePath (
    'jsprev2-selection-{0}.json' -f
    (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
)
$scanSelection | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $selectionFile -Encoding utf8
$selectionSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $selectionFile).Hash.ToLowerInvariant()

$receipt = [ordered]@{
    schema = $receiptSchema
    validatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
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
    scan = [ordered]@{
        status = 'PASS'
        schema = $scanSelection.schema
        packId = $scanSelection.packId
        tileCount = [int]$scanSelection.tileCount
        groupCount = [int]$scanSelection.groupCount
        textureCount = [int]$scanSelection.textureCount
        triangleCount = [long]$scanSelection.triangleCount
        totalBytes = [long]$scanSelection.totalBytes
        localPackPath = $scanPackPath
        selectionReceipt = $selectionFile
        selectionReceiptSha256 = $selectionSha256
    }
    runtime = [ordered]@{
        car = 'legacy_ts_m6 owner-accepted baseline; mechanics unchanged'
        map = 'E2R authority 959aefb78587ce60cf2b8eb03ff82797a4165142'
        scan = 'JSPREV2 exact 25/25; shared render/collision origin'
        meshEdgeParity = 'binding welds vertices; native identifyEdges parity not claimed'
        nativeParity = 'NOT CLAIMED'
        ownerBrowserObservation = 'PENDING'
    }
}

$receiptFile = Join-Path $evidencePath (
    'jv-web-car-map-scan-{0}.json' -f
    (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
)
$receipt | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $receiptFile -Encoding utf8

Write-Host ''
Write-Host 'JV WEB CAR + MAP + SCAN: SOURCE/PACKAGE/ASSET GATE PASS'
Write-Host ('Worktree:       {0}' -f $selectedWorktree)
Write-Host ('Branch:         {0}' -f $selectedLocalBranch)
Write-Host ('Commit:         {0}' -f $targetCommit)
Write-Host ('Gate log:       {0}' -f $gateLog)
Write-Host ('Gate SHA256:    {0}' -f $gateLogSha256)
Write-Host ('Scan pack:      {0}' -f $scanPackPath)
Write-Host ('Scan contract:  {0} groups / {1} textures' -f
    $scanSelection.groupCount,
    $scanSelection.textureCount
)
Write-Host ('Receipt:        {0}' -f $receiptFile)

if ($ValidateOnly) {
    Write-Host 'Browser server was not started because -ValidateOnly was supplied.'
    exit 0
}

Write-Host ''
Write-Host ('Starting the integrated product at http://localhost:{0}' -f $Port)
Write-Host 'Target: working car + E2R map + textured JSPREV2 scan + real Box3D collision.'
Write-Host 'The accepted baseline may remain on port 5173.'
Write-Host 'Keep this PowerShell window open. Press Ctrl+C to stop this server.'
Write-Host ''

$devCode = Invoke-NativeCode -File 'npm' -Arguments @(
    'run', 'dev', '--', '--host', '0.0.0.0', '--port', $Port.ToString(), '--strictPort'
) -WorkingDirectory $selectedWorktree
exit $devCode
