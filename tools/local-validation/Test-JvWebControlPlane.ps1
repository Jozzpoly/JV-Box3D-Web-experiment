[CmdletBinding()]
param(
    [string]$RepositoryPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-NormalizedFullPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $slashPath = $fullPath -replace '\\', '/'
    return ($slashPath -replace '/+$', '')
}

function Invoke-GitText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $oldPreference = $ErrorActionPreference
    $output = @()
    $exitCode = 0
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& git -C $RepositoryRoot @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }

    if ($exitCode -ne 0) {
        throw ('git {0} failed with exit code {1}.{2}{3}' -f
            ($Arguments -join ' '),
            $exitCode,
            [Environment]::NewLine,
            (($output | Out-String).Trim())
        )
    }

    return (($output | Out-String).Trim())
}

function Invoke-GitQuietCode {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $oldPreference = $ErrorActionPreference
    $exitCode = 0
    try {
        $ErrorActionPreference = 'Continue'
        & git -C $RepositoryRoot @Arguments 1>$null 2>$null
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }

    return [int]$exitCode
}

function Get-TrackedPaths {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $text = Invoke-GitText -RepositoryRoot $RepositoryRoot -Arguments @('ls-files', '--', $Pattern)
    if ([string]::IsNullOrWhiteSpace($text)) {
        return @()
    }

    return @($text -split "`r?`n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Required command 'git' is not available."
}

if (-not $RepositoryPath) {
    $RepositoryPath = Join-Path $PSScriptRoot '..\..'
}

$repositoryRoot = ConvertTo-NormalizedFullPath -Path $RepositoryPath
$reportedRootText = Invoke-GitText -RepositoryRoot $repositoryRoot -Arguments @('rev-parse', '--show-toplevel')
$reportedRoot = ConvertTo-NormalizedFullPath -Path $reportedRootText

if (-not [string]::Equals($repositoryRoot, $reportedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw ("RepositoryPath must be the repository root. Git reported '{0}'." -f $reportedRoot)
}

$originUrl = Invoke-GitText -RepositoryRoot $repositoryRoot -Arguments @('remote', 'get-url', 'origin')
if ($originUrl -notmatch '([/:])Jozzpoly/JV-Box3D-Web-experiment(\.git)?$') {
    throw ("Unexpected origin '{0}'." -f $originUrl)
}

$requiredFiles = @(
    '.gitignore',
    'AI_PROJECT_MEMORY.md',
    'README.md',
    'docs/refoundation/BASELINE_MATRIX.json',
    'docs/refoundation/BRANCH_POLICY.md',
    'docs/refoundation/DECISION_REGISTER.md',
    'docs/refoundation/EVIDENCE_STANDARD.md',
    'docs/refoundation/RECOVERY_PLAN.md',
    'docs/refoundation/VALIDATED_STATE.md',
    'docs/local-validation/README.md',
    'docs/local-validation/EVIDENCE_BUNDLE.md',
    'tools/local-validation/validation-targets.json',
    'tools/local-validation/result.schema.json',
    'tools/local-validation/Test-JvWebPowerShellSyntax.ps1',
    'tools/local-validation/Invoke-JvWebBaseline.ps1',
    'tools/local-validation/Test-JvWebControlPlane.ps1'
)

$failures = New-Object 'System.Collections.Generic.List[string]'

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $failures.Add(('Missing required file: {0}' -f $relativePath))
        continue
    }

    $trackedCode = Invoke-GitQuietCode -RepositoryRoot $repositoryRoot -Arguments @('ls-files', '--error-unmatch', '--', $relativePath)
    if ($trackedCode -ne 0) {
        $failures.Add(('Required file is not tracked: {0}' -f $relativePath))
        continue
    }

    $diffCode = Invoke-GitQuietCode -RepositoryRoot $repositoryRoot -Arguments @('diff', '--quiet', '--no-ext-diff', 'HEAD', '--', $relativePath)
    if ($diffCode -eq 1) {
        $failures.Add(('Required file differs from HEAD: {0}' -f $relativePath))
    }
    elseif ($diffCode -ne 0) {
        $failures.Add(('Unable to verify tracked content for: {0}' -f $relativePath))
    }
}

$jsonFiles = @(
    'docs/refoundation/BASELINE_MATRIX.json',
    'tools/local-validation/validation-targets.json',
    'tools/local-validation/result.schema.json'
)

foreach ($relativePath in $jsonFiles) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
        try {
            Get-Content -Raw -LiteralPath $fullPath | ConvertFrom-Json | Out-Null
        }
        catch {
            $failures.Add(('Invalid JSON in {0}: {1}' -f $relativePath, $_.Exception.Message))
        }
    }
}

$targetsPath = Join-Path $repositoryRoot 'tools/local-validation/validation-targets.json'
if (Test-Path -LiteralPath $targetsPath -PathType Leaf) {
    try {
        $targets = Get-Content -Raw -LiteralPath $targetsPath | ConvertFrom-Json
        $ids = @($targets.targets | ForEach-Object { $_.id })
        if (($ids | Select-Object -Unique).Count -ne $ids.Count) {
            $failures.Add('Duplicate executable target IDs in validation-targets.json.')
        }

        foreach ($target in $targets.targets) {
            if ($target.commit -notmatch '^[0-9a-f]{40}$') {
                $failures.Add(('Target {0} has an invalid commit SHA.' -f $target.id))
            }
            if ($target.requiredNodeVersion -notmatch '^v\d+\.\d+\.\d+$') {
                $failures.Add(('Target {0} has an invalid exact Node version.' -f $target.id))
            }
            if ($target.requiredNpmVersion -notmatch '^\d+\.\d+\.\d+$') {
                $failures.Add(('Target {0} has an invalid exact npm version.' -f $target.id))
            }
            if ($target.sourceChangesAllowed -ne $false) {
                $failures.Add(('Target {0} unexpectedly allows source changes.' -f $target.id))
            }
        }
    }
    catch {
        $failures.Add(('Unable to validate target registry semantics: {0}' -f $_.Exception.Message))
    }
}

$powerShellPaths = @(Get-TrackedPaths -RepositoryRoot $repositoryRoot -Pattern '*.ps1')
foreach ($relativePath in $powerShellPaths) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $failures.Add(('Tracked PowerShell file is missing: {0}' -f $relativePath))
        continue
    }

    $tokens = $null
    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile(
        $fullPath,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    foreach ($parseError in @($parseErrors)) {
        $failures.Add(('PowerShell parse error in {0}, line {1}, column {2}: {3}' -f
            $relativePath,
            $parseError.Extent.StartLineNumber,
            $parseError.Extent.StartColumnNumber,
            $parseError.Message
        ))
    }
}

$workflowPaths = @(Get-TrackedPaths -RepositoryRoot $repositoryRoot -Pattern '.github/workflows/*')
if ($workflowPaths.Count -gt 0) {
    $failures.Add('Control plane unexpectedly contains tracked GitHub Actions workflows.')
}

$linkPattern = '\[[^\]]+\]\((?!https?://|mailto:|#)([^)#]+)(?:#[^)]+)?\)'
$markdownPaths = @(Get-TrackedPaths -RepositoryRoot $repositoryRoot -Pattern '*.md')
foreach ($relativePath in $markdownPaths) {
    $markdownPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $markdownPath -PathType Leaf)) {
        $failures.Add(('Tracked Markdown file is missing: {0}' -f $relativePath))
        continue
    }

    $content = Get-Content -Raw -LiteralPath $markdownPath
    foreach ($match in [regex]::Matches($content, $linkPattern)) {
        $relativeLink = [System.Uri]::UnescapeDataString($match.Groups[1].Value)
        if ($relativeLink -match '[\*\?\|]') {
            continue
        }

        $targetPath = [System.IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $markdownPath) $relativeLink))
        if (-not (Test-Path -LiteralPath $targetPath)) {
            $failures.Add(('Broken relative link in {0}: {1}' -f $relativePath, $relativeLink))
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Host 'JV WEB CONTROL PLANE CHECK: FAIL'
    foreach ($failure in $failures) {
        Write-Host (' - {0}' -f $failure)
    }
    exit 1
}

$activeStatus = Invoke-GitText -RepositoryRoot $repositoryRoot -Arguments @('status', '--porcelain=v1', '--untracked-files=all')
$activeState = if ([string]::IsNullOrWhiteSpace($activeStatus)) { 'clean' } else { 'dirty but untouched' }

Write-Host 'JV WEB CONTROL PLANE CHECK: PASS'
Write-Host 'Tracked files, JSON, PowerShell syntax, tracked Markdown links and no-Actions boundary are valid.'
Write-Host ('Active worktree: {0}' -f $activeState)
exit 0
