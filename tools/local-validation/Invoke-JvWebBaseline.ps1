[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("R1", "R2")]
    [string]$Target,
    [string]$RepositoryPath,
    [string]$ValidationRoot,
    [switch]$FetchMissingRef,
    [switch]$PreflightOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-NativeText {
    param([string]$File, [string[]]$Args, [string]$WorkingDirectory)
    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    try {
        if ($WorkingDirectory) { Set-Location -LiteralPath $WorkingDirectory }
        $ErrorActionPreference = "Continue"
        $output = @(& $File @Args 2>&1)
        $code = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }
    if ($code -ne 0) {
        throw "$File failed with exit code $code.`n$($output -join [Environment]::NewLine)"
    }
    return (($output | Out-String).Trim())
}

function Invoke-Captured {
    param([string]$File, [string[]]$Args, [string]$WorkingDirectory, [string]$LogPath)
    @(
        "COMMAND: $File $($Args -join ' ')",
        "WORKDIR: $WorkingDirectory",
        "STARTED: $((Get-Date).ToUniversalTime().ToString('o'))",
        ""
    ) | Out-File -LiteralPath $LogPath -Encoding utf8

    $oldLocation = Get-Location
    $oldPreference = $ErrorActionPreference
    try {
        Set-Location -LiteralPath $WorkingDirectory
        $ErrorActionPreference = "Continue"
        $output = @(& $File @Args 2>&1)
        $code = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
        Set-Location -LiteralPath $oldLocation.Path
    }

    $output | ForEach-Object { Write-Host $_ }
    $output | Out-File -LiteralPath $LogPath -Encoding utf8 -Append
    @(
        "",
        "EXIT_CODE: $code",
        "FINISHED: $((Get-Date).ToUniversalTime().ToString('o'))"
    ) | Out-File -LiteralPath $LogPath -Encoding utf8 -Append
    return [int]$code
}

function Get-Status {
    param([string]$Path)
    $oldPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $output = @(& git -C $Path status --porcelain=v1 --untracked-files=all 2>&1)
        $code = $LASTEXITCODE
    }
    finally { $ErrorActionPreference = $oldPreference }
    if ($code -ne 0) { throw "git status failed for '$Path'." }
    return $output
}

function Get-Record {
    param([string]$BasePath, [string]$FilePath)
    $item = Get-Item -LiteralPath $FilePath
    return [ordered]@{
        path = $item.FullName.Substring($BasePath.Length).TrimStart('\', '/').Replace('\', '/')
        bytes = $item.Length
        sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $item.FullName).Hash.ToLowerInvariant()
    }
}

function Assert-ControlFile {
    param([string]$RepositoryRoot, [string]$RelativePath)
    $fullPath = Join-Path $RepositoryRoot $RelativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw "Missing control-plane file: $RelativePath"
    }
    $expected = Invoke-NativeText "git" @("-C", $RepositoryRoot, "rev-parse", "HEAD:$RelativePath") $null
    $actual = Invoke-NativeText "git" @("-C", $RepositoryRoot, "hash-object", "--no-filters", $fullPath) $null
    if ($expected -ne $actual) { throw "Control-plane file differs from HEAD: $RelativePath" }
}

function Write-Checksums {
    param([string]$EvidenceDirectory)
    $checksumPath = Join-Path $EvidenceDirectory "SHA256SUMS.txt"
    @(
        Get-ChildItem -LiteralPath $EvidenceDirectory -File -Recurse |
            Where-Object { $_.FullName -ne $checksumPath } |
            Sort-Object FullName |
            ForEach-Object {
                $relative = $_.FullName.Substring($EvidenceDirectory.Length).TrimStart('\', '/').Replace('\', '/')
                $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName).Hash.ToLowerInvariant()
                "$hash  $relative"
            }
    ) | Out-File -LiteralPath $checksumPath -Encoding ascii
}

foreach ($command in @("git", "node", "npm")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command '$command' is unavailable."
    }
}

if (-not $RepositoryPath) { $RepositoryPath = Join-Path $PSScriptRoot "..\.." }
$repositoryCandidate = [IO.Path]::GetFullPath($RepositoryPath).TrimEnd('\', '/')
$repositoryRoot = (Invoke-NativeText "git" @("-C", $repositoryCandidate, "rev-parse", "--show-toplevel") $null).TrimEnd('\', '/')
if (-not [string]::Equals($repositoryCandidate, $repositoryRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "RepositoryPath must be the repository root."
}

$origin = Invoke-NativeText "git" @("-C", $repositoryRoot, "remote", "get-url", "origin") $null
if ($origin -notmatch '([/:])Jozzpoly/JV-Box3D-Web-experiment(\.git)?$') {
    throw "Unexpected origin '$origin'."
}

$controlFiles = @(
    "tools/local-validation/Invoke-JvWebBaseline.ps1",
    "tools/local-validation/validation-targets.json",
    "tools/local-validation/result.schema.json"
)
foreach ($file in $controlFiles) { Assert-ControlFile $repositoryRoot $file }

$config = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot "validation-targets.json") | ConvertFrom-Json
if ($config.repository -ne "Jozzpoly/JV-Box3D-Web-experiment") { throw "Target registry repository mismatch." }
$matches = @($config.targets | Where-Object { $_.id -eq $Target })
if ($matches.Count -ne 1) { throw "Target '$Target' is missing or duplicated." }
$spec = $matches[0]

$nodeVersion = Invoke-NativeText "node" @("--version") $null
$npmVersion = Invoke-NativeText "npm" @("--version") $null
$gitVersion = Invoke-NativeText "git" @("--version") $null
$powerShellVersion = $PSVersionTable.PSVersion.ToString()
if ($nodeVersion -ne $spec.requiredNodeVersion) {
    throw "Exact Node $($spec.requiredNodeVersion) is required; received '$nodeVersion'."
}
if ($npmVersion -ne $spec.requiredNpmVersion) {
    throw "Exact npm $($spec.requiredNpmVersion) is required; received '$npmVersion'."
}

$oldPreference = $ErrorActionPreference
try {
    $ErrorActionPreference = "Continue"
    & git -C $repositoryRoot cat-file -e "$($spec.commit)`^{commit}" 2>$null
    $commitExists = ($LASTEXITCODE -eq 0)
}
finally { $ErrorActionPreference = $oldPreference }

if (-not $commitExists -and $FetchMissingRef) {
    $fetchCode = Invoke-Captured "git" @("-C", $repositoryRoot, "fetch", "--no-tags", "origin", $spec.fetchRef) $repositoryRoot (Join-Path $env:TEMP "jv-web-fetch.log")
    if ($fetchCode -ne 0) { throw "Fetch failed; no worktree was created." }
    & git -C $repositoryRoot cat-file -e "$($spec.commit)`^{commit}" 2>$null
    $commitExists = ($LASTEXITCODE -eq 0)
}
if (-not $commitExists) { throw "Commit $($spec.commit) is unavailable locally." }

$controlHead = Invoke-NativeText "git" @("-C", $repositoryRoot, "rev-parse", "HEAD") $null
$activeStatus = @(Get-Status $repositoryRoot)
if ($PreflightOnly) {
    Write-Host "JV WEB LOCAL VALIDATION PREFLIGHT: PASS"
    Write-Host "Target: $Target  Commit: $($spec.commit)"
    Write-Host "Node: $nodeVersion  npm: $npmVersion  PowerShell: $powerShellVersion"
    Write-Host "Active tree: $(if ($activeStatus.Count -eq 0) { 'clean' } else { 'dirty but untouched' })"
    exit 0
}

if (-not $ValidationRoot) {
    $ValidationRoot = Join-Path (Split-Path -Parent $repositoryRoot) "_JV_WEB_LOCAL_VALIDATION"
}
$validationRoot = [IO.Path]::GetFullPath($ValidationRoot).TrimEnd('\', '/')
$repoPrefix = $repositoryRoot + [IO.Path]::DirectorySeparatorChar
if ($validationRoot -eq $repositoryRoot -or $validationRoot.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw "ValidationRoot must be outside the repository."
}

$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssfffZ")
$runName = "$Target-$($spec.commit.Substring(0, 12))-$stamp"
$evidence = Join-Path $validationRoot "evidence\$runName"
$worktree = Join-Path $validationRoot "worktrees\$runName"
$archive = "$evidence.zip"
New-Item -ItemType Directory -Path $evidence -Force | Out-Null
New-Item -ItemType Directory -Path (Split-Path -Parent $worktree) -Force | Out-Null

$gateCode = 125
$classification = "HARNESS_FAILED"
$failure = $null
$headBefore = $spec.commit
$headAfter = $spec.commit
$cleanBefore = $false
$cleanAfter = $false
$artifactsCaptured = $false

try {
    [ordered]@{
        schema = "JV_WEB_LOCAL_VALIDATION_ENVIRONMENT_V1"
        createdAtUtc = (Get-Date).ToUniversalTime().ToString("o")
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
    } | ConvertTo-Json -Depth 5 | Out-File (Join-Path $evidence "environment.json") -Encoding utf8

    $harnessRecords = @($controlFiles | ForEach-Object { Get-Record $repositoryRoot (Join-Path $repositoryRoot $_) })
    ConvertTo-Json -InputObject $harnessRecords -Depth 5 | Out-File (Join-Path $evidence "harness-identity.json") -Encoding utf8

    $worktreeCode = Invoke-Captured "git" @("-C", $repositoryRoot, "worktree", "add", "--detach", $worktree, $spec.commit) $repositoryRoot (Join-Path $evidence "worktree-add.log")
    if ($worktreeCode -ne 0) { throw "Detached worktree creation failed." }

    $headBefore = Invoke-NativeText "git" @("-C", $worktree, "rev-parse", "HEAD") $null
    $statusBefore = @(Get-Status $worktree)
    ($statusBefore -join [Environment]::NewLine) | Out-File (Join-Path $evidence "git-status-before.txt") -Encoding utf8
    $cleanBefore = ($statusBefore.Count -eq 0)
    if ($headBefore -ne $spec.commit -or -not $cleanBefore) { throw "Invalid initial worktree identity or cleanliness." }

    Invoke-NativeText "git" @("-C", $worktree, "show", "-s", "--format=fuller", "--decorate=full", "HEAD") $null |
        Out-File (Join-Path $evidence "target-commit.txt") -Encoding utf8

    $sourceRecords = @()
    foreach ($relative in @("package.json", "package-lock.json", $spec.gateScript)) {
        $path = Join-Path $worktree $relative
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing target identity file: $relative" }
        $sourceRecords += Get-Record $worktree $path
    }
    ConvertTo-Json -InputObject $sourceRecords -Depth 5 | Out-File (Join-Path $evidence "source-identity.json") -Encoding utf8

    $shell = if ($PSVersionTable.PSEdition -eq "Core") { Join-Path $PSHOME "pwsh.exe" } else { Join-Path $PSHOME "powershell.exe" }
    if (-not (Test-Path -LiteralPath $shell -PathType Leaf)) { throw "Current PowerShell executable was not found." }
    $gateCode = Invoke-Captured $shell @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $worktree $spec.gateScript)) $worktree (Join-Path $evidence "gate.log")

    $headAfter = Invoke-NativeText "git" @("-C", $worktree, "rev-parse", "HEAD") $null
    $statusAfter = @(Get-Status $worktree)
    ($statusAfter -join [Environment]::NewLine) | Out-File (Join-Path $evidence "git-status-after.txt") -Encoding utf8
    $cleanAfter = ($statusAfter.Count -eq 0)
    Invoke-NativeText "git" @("-C", $worktree, "diff", "--no-ext-diff", "--binary") $null |
        Out-File (Join-Path $evidence "git-diff-after.patch") -Encoding utf8

    $dist = Join-Path $worktree "dist"
    if (Test-Path -LiteralPath $dist -PathType Container) {
        $destination = Join-Path $evidence "artifacts\dist"
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        Copy-Item -LiteralPath $dist -Destination $destination -Recurse -Force
        $records = @(Get-ChildItem $destination -File -Recurse | Sort-Object FullName | ForEach-Object { Get-Record $destination $_.FullName })
        ConvertTo-Json -InputObject $records -Depth 5 | Out-File (Join-Path $evidence "artifact-manifest.json") -Encoding utf8
        $artifactsCaptured = $true
    }

    if ($gateCode -eq 0 -and $cleanBefore -and $cleanAfter -and $headBefore -eq $spec.commit -and $headAfter -eq $spec.commit) {
        $classification = $spec.passClassification
    }
    else { $classification = $spec.failClassification }
}
catch {
    $failure = $_.Exception.Message
    $failure | Out-File (Join-Path $evidence "harness-error.txt") -Encoding utf8
}
finally {
    [ordered]@{
        schema = "JV_WEB_LOCAL_VALIDATION_RESULT_V1"
        targetId = $Target
        sourceCommit = $spec.commit
        classification = $classification
        gateExitCode = [int]$gateCode
        createdAtUtc = (Get-Date).ToUniversalTime().ToString("o")
        repository = [ordered]@{ root = $repositoryRoot; origin = $origin; controlHeadAtInvocation = $controlHead }
        toolchain = [ordered]@{ git = $gitVersion; node = $nodeVersion; npm = $npmVersion; powerShell = $powerShellVersion }
        worktree = [ordered]@{ path = $worktree; retained = $true }
        sourceTree = [ordered]@{ cleanBefore = $cleanBefore; cleanAfter = $cleanAfter; headBefore = $headBefore; headAfter = $headAfter }
        artifactsCaptured = $artifactsCaptured
        failure = $failure
    } | ConvertTo-Json -Depth 8 | Out-File (Join-Path $evidence "RESULT.json") -Encoding utf8

    Write-Checksums $evidence
    Compress-Archive -Path (Join-Path $evidence "*") -DestinationPath $archive -CompressionLevel Optimal
    $zipHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash.ToLowerInvariant()
    "$zipHash  $([IO.Path]::GetFileName($archive))" | Out-File "$archive.sha256" -Encoding ascii
}

Write-Host "JV WEB LOCAL VALIDATION COMPLETE"
Write-Host "Classification: $classification"
Write-Host "Evidence: $evidence"
Write-Host "Worktree retained: $worktree"
if ($classification -eq $spec.passClassification) { exit 0 }
exit 1
