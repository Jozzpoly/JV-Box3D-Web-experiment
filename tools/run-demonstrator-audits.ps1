param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$expectedBranch = "agent/jv-web-demonstrator-foundation"
$publicReport = ".local-audit/public-readiness.json"
$licenseReport = ".local-audit/license-inventory.json"

function Invoke-NpmStep {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    Write-Host "`n==> $Label"
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

$repoRoot = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "This directory is not a Git repository."
}

$directorySeparators = @(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
)
$resolvedRoot = [System.IO.Path]::GetFullPath($root).TrimEnd($directorySeparators)
$resolvedRepoRoot = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd($directorySeparators)
if ($resolvedRoot -ne $resolvedRepoRoot) {
    throw "Repository root mismatch. Script root: $resolvedRoot; Git root: $resolvedRepoRoot"
}

$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $currentBranch -ne $expectedBranch) {
    throw "Wrong branch. Expected '$expectedBranch', received '$currentBranch'."
}

$dirty = @(git status --porcelain --untracked-files=all)
if ($LASTEXITCODE -ne 0) {
    throw "git status failed."
}
if ($dirty.Count -gt 0) {
    Write-Host "Working tree changes:"
    $dirty | ForEach-Object { Write-Host "  $_" }
    throw "Public-readiness audits require a clean working tree. Nothing was modified."
}

$nodeVersion = (node --version).Trim()
if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v24\.') {
    throw "Node 24 is required. Received '$nodeVersion'."
}

Write-Host "Repository: $resolvedRepoRoot"
Write-Host "Branch:     $currentBranch"
Write-Host "Commit:     $((git rev-parse HEAD).Trim())"
Write-Host "Node:       $nodeVersion"
Write-Host "Mode:       REPORT ONLY / NO PUBLISHING"

Invoke-NpmStep "Generate secret-safe source/history readiness report" @(
    "run",
    "audit:public:report"
)
Invoke-NpmStep "Generate reachable project/third-party license inventory" @(
    "run",
    "audit:licenses:report"
)

foreach ($path in @($publicReport, $licenseReport)) {
    if (-not (Test-Path $path -PathType Leaf)) {
        throw "Expected audit report was not created: $path"
    }
    $report = Get-Content -Raw -Path $path | ConvertFrom-Json
    if ($null -eq $report.schemaVersion -or $null -eq $report.sourceCommit) {
        throw "Audit report has no schema/source identity: $path"
    }
    if ($report.sourceCommit -ne (git rev-parse HEAD).Trim()) {
        throw "Audit report commit mismatch in ${path}: $($report.sourceCommit)"
    }
}

Write-Host "`nDEMONSTRATOR AUDIT REPORTS: GENERATED"
Write-Host "Public/history report: $resolvedRoot\$publicReport"
Write-Host "License inventory:     $resolvedRoot\$licenseReport"
Write-Host "Publication:           NOT PERFORMED"
Write-Host "Interpretation:         findings still require classification and owner decisions"
Write-Host "SOURCE-PUBLIC-READY:    NOT CLAIMED"
