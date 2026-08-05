[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('R1', 'R2')]
    [string]$Target,
    [string]$RepositoryPath,
    [string]$ValidationRoot,
    [switch]$FetchMissingRef,
    [switch]$PreflightOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

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

function Invoke-Captured {
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

function Get-GitStatus {
    param([Parameter(Mandatory = $true)][string]$Path)

    $oldPreference = $ErrorActionPreference
    $output = @()
    $exitCode = 0
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& git -C $Path status --porcelain=v1 --untracked-files=all 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }

    if ($exitCode -ne 0) {
        throw ("git status failed for '{0}'." -f $Path)
    }

    return @($output)
}

function Get-FileRecord {
    param(
        [Parameter(Mandatory = $true)][string]$BasePath,
        [Parameter(Mandatory = $true)][string]$FilePath
    )

    $item = Get-Item -LiteralPath $FilePath
    return [ordered]@{
        path = $item.FullName.Substring($BasePath.Length).TrimStart('\', '/').Replace('\', '/')
        bytes = $item.Length
        sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $item.FullName).Hash.ToLowerInvariant()
    }
}

function Assert-ControlFile {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$RelativePath
    )

    $fullPath = Join-Path $RepositoryRoot $RelativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw ('Missing control-plane file: {0}' -f $RelativePath)
    }

    $trackedCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $RepositoryRoot, 'ls-files', '--error-unmatch', '--', $RelativePath)
    if ($trackedCode -ne 0) {
        throw ('Control-plane file is not tracked: {0}' -f $RelativePath)
    }

    $diffCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $RepositoryRoot, 'diff', '--quiet', '--no-ext-diff', 'HEAD', '--', $RelativePath)
    if ($diffCode -eq 1) {
        throw ('Control-plane file differs from HEAD: {0}' -f $RelativePath)
    }
    if ($diffCode -ne 0) {
        throw ('Unable to verify control-plane file: {0}' -f $RelativePath)
    }
}

function Write-Checksums {
    param([Parameter(Mandatory = $true)][string]$EvidenceDirectory)

    $checksumPath = Join-Path $EvidenceDirectory 'SHA256SUMS.txt'
    @(
        Get-ChildItem -LiteralPath $EvidenceDirectory -File -Recurse |
            Where-Object { $_.FullName -ne $checksumPath } |
            Sort-Object FullName |
            ForEach-Object {
                $relativePath = $_.FullName.Substring($EvidenceDirectory.Length).TrimStart('\', '/').Replace('\', '/')
                $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
                '{0}  {1}' -f $hash, $relativePath
            }
    ) | Out-File -LiteralPath $checksumPath -Encoding ascii
}

foreach ($command in @('git', 'node', 'npm')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw ("Required command '{0}' is unavailable." -f $command)
    }
}

if (-not $RepositoryPath) {
    $RepositoryPath = Join-Path $PSScriptRoot '..\..'
}

$repositoryCandidate = ConvertTo-NormalizedFullPath -Path $RepositoryPath
$reportedRootText = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryCandidate, 'rev-parse', '--show-toplevel')
$repositoryRoot = ConvertTo-NormalizedFullPath -Path $reportedRootText

if (-not [string]::Equals($repositoryCandidate, $repositoryRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw ("RepositoryPath must be the repository root. Git reported '{0}'." -f $repositoryRoot)
}

$origin = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'remote', 'get-url', 'origin')
if ($origin -notmatch '([/:])Jozzpoly/JV-Box3D-Web-experiment(\.git)?$') {
    throw ("Unexpected origin '{0}'." -f $origin)
}

$controlFiles = @(
    'tools/local-validation/Test-JvWebPowerShellSyntax.ps1',
    'tools/local-validation/Test-JvWebControlPlane.ps1',
    'tools/local-validation/Invoke-JvWebBaseline.ps1',
    'tools/local-validation/validation-targets.json',
    'tools/local-validation/result.schema.json'
)
foreach ($relativePath in $controlFiles) {
    Assert-ControlFile -RepositoryRoot $repositoryRoot -RelativePath $relativePath
}

$configPath = Join-Path $repositoryRoot 'tools/local-validation/validation-targets.json'
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
if ($config.repository -ne 'Jozzpoly/JV-Box3D-Web-experiment') {
    throw 'Target registry repository mismatch.'
}

$matches = @($config.targets | Where-Object { $_.id -eq $Target })
if ($matches.Count -ne 1) {
    throw ("Target '{0}' is missing or duplicated." -f $Target)
}
$spec = $matches[0]

$nodeVersion = Invoke-NativeText -File 'node' -Arguments @('--version')
$npmVersion = Invoke-NativeText -File 'npm' -Arguments @('--version')
$gitVersion = Invoke-NativeText -File 'git' -Arguments @('--version')
$powerShellVersion = $PSVersionTable.PSVersion.ToString()

if ($nodeVersion -ne $spec.requiredNodeVersion) {
    throw ("Exact Node {0} is required; received '{1}'." -f $spec.requiredNodeVersion, $nodeVersion)
}
if ($npmVersion -ne $spec.requiredNpmVersion) {
    throw ("Exact npm {0} is required; received '{1}'." -f $spec.requiredNpmVersion, $npmVersion)
}

$commitCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $repositoryRoot, 'cat-file', '-e', ('{0}^{{commit}}' -f $spec.commit))
if ($commitCode -ne 0 -and $FetchMissingRef) {
    $fetchLogPath = Join-Path $env:TEMP ('jv-web-fetch-{0}.log' -f ([Guid]::NewGuid().ToString('N')))
    $fetchCode = Invoke-Captured -File 'git' -Arguments @('-C', $repositoryRoot, 'fetch', '--no-tags', 'origin', $spec.fetchRef) -WorkingDirectory $repositoryRoot -LogPath $fetchLogPath
    if ($fetchCode -ne 0) {
        throw ("Fetch failed. See '{0}'. No worktree was created." -f $fetchLogPath)
    }
    $commitCode = Invoke-NativeQuietCode -File 'git' -Arguments @('-C', $repositoryRoot, 'cat-file', '-e', ('{0}^{{commit}}' -f $spec.commit))
}
if ($commitCode -ne 0) {
    throw ('Commit {0} is unavailable locally.' -f $spec.commit)
}

$controlHead = Invoke-NativeText -File 'git' -Arguments @('-C', $repositoryRoot, 'rev-parse', 'HEAD')
$activeStatus = @(Get-GitStatus -Path $repositoryRoot)
$activeState = if ($activeStatus.Count -eq 0) { 'clean' } else { 'dirty but untouched' }

if ($PreflightOnly) {
    Write-Host 'JV WEB LOCAL VALIDATION PREFLIGHT: PASS'
    Write-Host ('Target: {0}  Commit: {1}' -f $Target, $spec.commit)
    Write-Host ('Node: {0}  npm: {1}  PowerShell: {2}' -f $nodeVersion, $npmVersion, $powerShellVersion)
    Write-Host ('Active worktree: {0}' -f $activeState)
    exit 0
}

if (-not $ValidationRoot) {
    $ValidationRoot = Join-Path (Split-Path -Parent $repositoryRoot) '_JV_WEB_LOCAL_VALIDATION'
}

$validationRoot = ConvertTo-NormalizedFullPath -Path $ValidationRoot
$repositoryPrefix = $repositoryRoot + '/'
if (
    [string]::Equals($validationRoot, $repositoryRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    $validationRoot.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)
) {
    throw 'ValidationRoot must be outside the repository.'
}

$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
$runName = '{0}-{1}-{2}' -f $Target, $spec.commit.Substring(0, 12), $stamp
$evidence = Join-Path $validationRoot ('evidence\{0}' -f $runName)
$worktree = Join-Path $validationRoot ('worktrees\{0}' -f $runName)
$archive = '{0}.zip' -f $evidence

New-Item -ItemType Directory -Path $evidence -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path -Parent $worktree) -Force | Out-Null

$gateCode = 125
$classification = 'HARNESS_FAILED'
$failure = $null
$headBefore = [string]$spec.commit
$headAfter = [string]$spec.commit
$cleanBefore = $false
$cleanAfter = $false
$artifactsCaptured = $false
$packagingFailure = $null

try {
    [ordered]@{
        schema = 'JV_WEB_LOCAL_VALIDATION_ENVIRONMENT_V1'
        createdAtUtc = (Get-Date).ToUniversalTime().ToString('o')
        repositoryRoot = $repositoryRoot
        origin = $origin
        controlHeadAtInvocation = $controlHead
        controlWorkingTreeClean = ($activeStatus.Count -eq 0)
        targetId = $Target
        targetCommit = $spec.commit
        git = $gitVersion
        node = $nodeVersion
        npm = $npmVersion
        powerShell = $powerShellVersion
        os = [Environment]::OSVersion.VersionString
    } | ConvertTo-Json -Depth 5 | Out-File (Join-Path $evidence 'environment.json') -Encoding utf8

    $harnessRecords = @(
        $controlFiles | ForEach-Object {
            Get-FileRecord -BasePath $repositoryRoot -FilePath (Join-Path $repositoryRoot $_)
        }
    )
    ConvertTo-Json -InputObject $harnessRecords -Depth 5 | Out-File (Join-Path $evidence 'harness-identity.json') -Encoding utf8

    $worktreeCode = Invoke-Captured -File 'git' -Arguments @('-C', $repositoryRoot, 'worktree', 'add', '--detach', $worktree, $spec.commit) -WorkingDirectory $repositoryRoot -LogPath (Join-Path $evidence 'worktree-add.log')
    if ($worktreeCode -ne 0) {
        throw 'Detached worktree creation failed.'
    }

    $headBefore = Invoke-NativeText -File 'git' -Arguments @('-C', $worktree, 'rev-parse', 'HEAD')
    $statusBefore = @(Get-GitStatus -Path $worktree)
    ($statusBefore -join [Environment]::NewLine) | Out-File (Join-Path $evidence 'git-status-before.txt') -Encoding utf8
    $cleanBefore = ($statusBefore.Count -eq 0)
    if ($headBefore -ne $spec.commit -or -not $cleanBefore) {
        throw 'Invalid initial worktree identity or cleanliness.'
    }

    Invoke-NativeText -File 'git' -Arguments @('-C', $worktree, 'show', '-s', '--format=fuller', '--decorate=full', 'HEAD') |
        Out-File (Join-Path $evidence 'target-commit.txt') -Encoding utf8

    $sourceRecords = @()
    foreach ($relativePath in @('package.json', 'package-lock.json', $spec.gateScript)) {
        $fullPath = Join-Path $worktree $relativePath
        if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
            throw ('Missing target identity file: {0}' -f $relativePath)
        }
        $sourceRecords += Get-FileRecord -BasePath $worktree -FilePath $fullPath
    }
    ConvertTo-Json -InputObject $sourceRecords -Depth 5 | Out-File (Join-Path $evidence 'source-identity.json') -Encoding utf8

    if ($PSVersionTable.PSEdition -eq 'Core') {
        $shell = Join-Path $PSHOME 'pwsh.exe'
    }
    else {
        $shell = Join-Path $PSHOME 'powershell.exe'
    }
    if (-not (Test-Path -LiteralPath $shell -PathType Leaf)) {
        throw 'Current PowerShell executable was not found.'
    }

    $gateCode = Invoke-Captured -File $shell -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $worktree $spec.gateScript)) -WorkingDirectory $worktree -LogPath (Join-Path $evidence 'gate.log')

    $headAfter = Invoke-NativeText -File 'git' -Arguments @('-C', $worktree, 'rev-parse', 'HEAD')
    $statusAfter = @(Get-GitStatus -Path $worktree)
    ($statusAfter -join [Environment]::NewLine) | Out-File (Join-Path $evidence 'git-status-after.txt') -Encoding utf8
    $cleanAfter = ($statusAfter.Count -eq 0)
    Invoke-NativeText -File 'git' -Arguments @('-C', $worktree, 'diff', '--no-ext-diff', '--binary') |
        Out-File (Join-Path $evidence 'git-diff-after.patch') -Encoding utf8

    $distPath = Join-Path $worktree 'dist'
    if (Test-Path -LiteralPath $distPath -PathType Container) {
        $destination = Join-Path $evidence 'artifacts\dist'
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        Copy-Item -LiteralPath $distPath -Destination $destination -Recurse -Force
        $artifactRecords = @(
            Get-ChildItem -LiteralPath $destination -File -Recurse |
                Sort-Object FullName |
                ForEach-Object { Get-FileRecord -BasePath $destination -FilePath $_.FullName }
        )
        ConvertTo-Json -InputObject $artifactRecords -Depth 5 | Out-File (Join-Path $evidence 'artifact-manifest.json') -Encoding utf8
        $artifactsCaptured = $true
    }

    if (
        $gateCode -eq 0 -and
        $cleanBefore -and
        $cleanAfter -and
        $headBefore -eq $spec.commit -and
        $headAfter -eq $spec.commit
    ) {
        $classification = [string]$spec.passClassification
    }
    else {
        $classification = [string]$spec.failClassification
    }
}
catch {
    $failure = $_.Exception.Message
    $failure | Out-File (Join-Path $evidence 'harness-error.txt') -Encoding utf8
}
finally {
    [ordered]@{
        schema = 'JV_WEB_LOCAL_VALIDATION_RESULT_V1'
        targetId = $Target
        sourceCommit = $spec.commit
        classification = $classification
        gateExitCode = [int]$gateCode
        createdAtUtc = (Get-Date).ToUniversalTime().ToString('o')
        repository = [ordered]@{
            root = $repositoryRoot
            origin = $origin
            controlHeadAtInvocation = $controlHead
        }
        toolchain = [ordered]@{
            git = $gitVersion
            node = $nodeVersion
            npm = $npmVersion
            powerShell = $powerShellVersion
        }
        worktree = [ordered]@{
            path = $worktree
            retained = $true
        }
        sourceTree = [ordered]@{
            cleanBefore = $cleanBefore
            cleanAfter = $cleanAfter
            headBefore = $headBefore
            headAfter = $headAfter
        }
        artifactsCaptured = $artifactsCaptured
        failure = $failure
    } | ConvertTo-Json -Depth 8 | Out-File (Join-Path $evidence 'RESULT.json') -Encoding utf8

    try {
        Write-Checksums -EvidenceDirectory $evidence
        Compress-Archive -Path (Join-Path $evidence '*') -DestinationPath $archive -CompressionLevel Optimal
        $zipHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash.ToLowerInvariant()
        ('{0}  {1}' -f $zipHash, [System.IO.Path]::GetFileName($archive)) | Out-File ('{0}.sha256' -f $archive) -Encoding ascii
    }
    catch {
        $packagingFailure = $_.Exception.Message
        $packagingFailure | Out-File (Join-Path $evidence 'packaging-error.txt') -Encoding utf8
    }
}

Write-Host 'JV WEB LOCAL VALIDATION COMPLETE'
Write-Host ('Classification: {0}' -f $classification)
Write-Host ('Evidence: {0}' -f $evidence)
Write-Host ('Worktree retained: {0}' -f $worktree)
if ($packagingFailure) {
    Write-Host ('Packaging warning: {0}' -f $packagingFailure)
}

if ($classification -eq $spec.passClassification -and -not $packagingFailure) {
    exit 0
}
exit 1
