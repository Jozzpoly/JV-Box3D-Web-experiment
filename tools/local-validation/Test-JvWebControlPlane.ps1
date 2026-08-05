[CmdletBinding()]
param(
    [string]$RepositoryPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $RepositoryPath) {
    $RepositoryPath = Join-Path $PSScriptRoot "..\.."
}

$repositoryRoot = [System.IO.Path]::GetFullPath($RepositoryPath).TrimEnd('\', '/')
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Required command 'git' is not available."
}

$reportedRoot = @(& git -C $repositoryRoot rev-parse --show-toplevel 2>&1)
if ($LASTEXITCODE -ne 0) {
    throw "RepositoryPath is not a Git repository: $repositoryRoot"
}
$reportedRoot = (($reportedRoot | Out-String).Trim()).TrimEnd('\', '/')
if (-not [string]::Equals($repositoryRoot, $reportedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "RepositoryPath must be the repository root. Git reported '$reportedRoot'."
}

$originUrl = @(& git -C $repositoryRoot remote get-url origin 2>&1)
if ($LASTEXITCODE -ne 0) {
    throw "Unable to read origin URL."
}
$originUrl = (($originUrl | Out-String).Trim())
if ($originUrl -notmatch '([/:])Jozzpoly/JV-Box3D-Web-experiment(\.git)?$') {
    throw "Unexpected origin '$originUrl'."
}

$requiredFiles = @(
    ".gitignore",
    "AI_PROJECT_MEMORY.md",
    "README.md",
    "docs/refoundation/BASELINE_MATRIX.json",
    "docs/refoundation/BRANCH_POLICY.md",
    "docs/refoundation/DECISION_REGISTER.md",
    "docs/refoundation/EVIDENCE_STANDARD.md",
    "docs/refoundation/RECOVERY_PLAN.md",
    "docs/refoundation/VALIDATED_STATE.md",
    "docs/local-validation/README.md",
    "docs/local-validation/EVIDENCE_BUNDLE.md",
    "tools/local-validation/validation-targets.json",
    "tools/local-validation/result.schema.json",
    "tools/local-validation/Invoke-JvWebBaseline.ps1",
    "tools/local-validation/Test-JvWebControlPlane.ps1"
)

$failures = New-Object System.Collections.Generic.List[string]

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $failures.Add("Missing required file: $relativePath")
        continue
    }

    & git -C $repositoryRoot ls-files --error-unmatch -- $relativePath 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("Required file is not tracked: $relativePath")
        continue
    }

    $expectedBlob = @(& git -C $repositoryRoot rev-parse "HEAD:$relativePath" 2>&1)
    $expectedExit = $LASTEXITCODE
    $actualBlob = @(& git -C $repositoryRoot hash-object --no-filters $fullPath 2>&1)
    $actualExit = $LASTEXITCODE
    if ($expectedExit -ne 0 -or $actualExit -ne 0) {
        $failures.Add("Unable to verify tracked bytes for: $relativePath")
        continue
    }
    if ((($expectedBlob | Out-String).Trim()) -ne (($actualBlob | Out-String).Trim())) {
        $failures.Add("Required file differs from HEAD: $relativePath")
    }
}

$jsonFiles = @(
    "docs/refoundation/BASELINE_MATRIX.json",
    "tools/local-validation/validation-targets.json",
    "tools/local-validation/result.schema.json"
)

foreach ($relativePath in $jsonFiles) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
        try {
            Get-Content -Raw -LiteralPath $fullPath | ConvertFrom-Json | Out-Null
        }
        catch {
            $failures.Add("Invalid JSON in $relativePath: $($_.Exception.Message)")
        }
    }
}

$targetsPath = Join-Path $repositoryRoot "tools/local-validation/validation-targets.json"
if (Test-Path -LiteralPath $targetsPath -PathType Leaf) {
    $targets = Get-Content -Raw -LiteralPath $targetsPath | ConvertFrom-Json
    $ids = @($targets.targets | ForEach-Object { $_.id })
    if (($ids | Select-Object -Unique).Count -ne $ids.Count) {
        $failures.Add("Duplicate executable target IDs in validation-targets.json.")
    }

    foreach ($target in $targets.targets) {
        if ($target.commit -notmatch '^[0-9a-f]{40}$') {
            $failures.Add("Target $($target.id) has an invalid commit SHA.")
        }
        if ($target.requiredNodeVersion -notmatch '^v\d+\.\d+\.\d+$') {
            $failures.Add("Target $($target.id) has an invalid exact Node version.")
        }
        if ($target.requiredNpmVersion -notmatch '^\d+\.\d+\.\d+$') {
            $failures.Add("Target $($target.id) has an invalid exact npm version.")
        }
        if ($target.sourceChangesAllowed -ne $false) {
            $failures.Add("Target $($target.id) unexpectedly allows source changes.")
        }
    }
}

$powerShellFiles = Get-ChildItem -LiteralPath (Join-Path $repositoryRoot "tools") -Filter "*.ps1" -File -Recurse
foreach ($file in $powerShellFiles) {
    $tokens = $null
    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile(
        $file.FullName,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    foreach ($parseError in @($parseErrors)) {
        $relativePath = $file.FullName.Substring($repositoryRoot.Length).TrimStart('\', '/')
        $failures.Add("PowerShell parse error in ${relativePath}: $($parseError.Message)")
    }
}

$workflowDirectory = Join-Path $repositoryRoot ".github/workflows"
if (Test-Path -LiteralPath $workflowDirectory -PathType Container) {
    $workflowFiles = @(Get-ChildItem -LiteralPath $workflowDirectory -File -Recurse)
    if ($workflowFiles.Count -gt 0) {
        $failures.Add("Control plane unexpectedly contains GitHub Actions workflows.")
    }
}

$markdownFiles = Get-ChildItem -LiteralPath $repositoryRoot -Filter "*.md" -File -Recurse
$linkPattern = '\[[^\]]+\]\((?!https?://|mailto:|#)([^)#]+)(?:#[^)]+)?\)'
foreach ($markdownFile in $markdownFiles) {
    $content = Get-Content -Raw -LiteralPath $markdownFile.FullName
    foreach ($match in [regex]::Matches($content, $linkPattern)) {
        $relativeLink = [System.Uri]::UnescapeDataString($match.Groups[1].Value)
        if ($relativeLink -match '[\*\?\|]') {
            continue
        }

        $targetPath = [System.IO.Path]::GetFullPath((Join-Path $markdownFile.DirectoryName $relativeLink))
        if (-not (Test-Path -LiteralPath $targetPath)) {
            $sourceRelative = $markdownFile.FullName.Substring($repositoryRoot.Length).TrimStart('\', '/')
            $failures.Add("Broken relative link in ${sourceRelative}: $relativeLink")
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Host "JV WEB CONTROL PLANE CHECK: FAIL"
    foreach ($failure in $failures) {
        Write-Host " - $failure"
    }
    exit 1
}

Write-Host "JV WEB CONTROL PLANE CHECK: PASS"
Write-Host "Required files, JSON, PowerShell syntax, relative links and no-Actions boundary are valid."
exit 0
