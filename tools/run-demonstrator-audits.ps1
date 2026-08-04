param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$expectedBranch = "agent/jv-web-demonstrator-foundation"
$publicReport = ".local-audit/public-readiness.json"
$licenseReport = ".local-audit/license-inventory.json"
$reviewLedger = ".local-audit/public-review-classifications.json"
$integrationReport = ".local-audit/source-public-integration.json"

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

function Assert-CleanWorkingTree {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Context
    )

    $changes = @(git status --porcelain --untracked-files=all)
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed during $Context."
    }
    if ($changes.Count -gt 0) {
        Write-Host "Working tree changes during ${Context}:"
        $changes | ForEach-Object { Write-Host "  $_" }
        throw "Public-readiness audits require a clean source tree. Nothing was deleted or reset."
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
$sourceCommit = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceCommit -notmatch '^[0-9a-f]{40}$') {
    throw "Unable to resolve the exact source commit."
}

Assert-CleanWorkingTree -Context "initial audit check"

$nodeVersion = (node --version).Trim()
if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v24\.') {
    throw "Node 24 is required. Received '$nodeVersion'."
}

Write-Host "Repository: $resolvedRepoRoot"
Write-Host "Branch:     $currentBranch"
Write-Host "Commit:     $sourceCommit"
Write-Host "Node:       $nodeVersion"
Write-Host "Mode:       REPORT ONLY / NO REF OR VISIBILITY CHANGE"
Write-Host "Precondition: run 'git fetch origin --prune' immediately before this script for a current origin/main proof."

Invoke-NpmStep "Generate secret-safe source/history readiness report" @(
    "run",
    "audit:public:report"
)
Invoke-NpmStep "Generate reachable project/third-party license inventory" @(
    "run",
    "audit:licenses:report"
)
Invoke-NpmStep "Prepare the local review-classification ledger" @(
    "run",
    "audit:public:review-template"
)
Invoke-NpmStep "Record the nonmutating origin/main integration relation" @(
    "run",
    "audit:integration:report"
)

foreach ($path in @($publicReport, $licenseReport, $reviewLedger)) {
    if (-not (Test-Path $path -PathType Leaf)) {
        throw "Expected audit evidence was not created: $path"
    }
    $report = Get-Content -Raw -Path $path | ConvertFrom-Json
    if ($null -eq $report.schemaVersion -or $null -eq $report.sourceCommit) {
        throw "Audit evidence has no schema/source identity: $path"
    }
    if ($report.sourceCommit -ne $sourceCommit) {
        throw "Audit evidence commit mismatch in ${path}: $($report.sourceCommit) != $sourceCommit"
    }
}

if (-not (Test-Path $integrationReport -PathType Leaf)) {
    throw "Expected integration proof was not created: $integrationReport"
}
$integrationData = Get-Content -Raw -Path $integrationReport | ConvertFrom-Json
if ($integrationData.schemaVersion -ne 1) {
    throw "Integration proof schema is missing or unsupported."
}
if ($integrationData.candidateCommit -ne $sourceCommit) {
    throw "Integration proof candidate mismatch: $($integrationData.candidateCommit) != $sourceCommit"
}
if ($integrationData.candidateBranch -ne $currentBranch) {
    throw "Integration proof branch mismatch: $($integrationData.candidateBranch) != $currentBranch"
}

$publicData = Get-Content -Raw -Path $publicReport | ConvertFrom-Json
$licenseData = Get-Content -Raw -Path $licenseReport | ConvertFrom-Json
$reviewData = Get-Content -Raw -Path $reviewLedger | ConvertFrom-Json
$pendingReviews = @(
    $reviewData.entries | Where-Object { $_.disposition -eq "PENDING" }
).Count
$remediationReviews = @(
    $reviewData.entries | Where-Object { $_.disposition -eq "REMEDIATE" }
).Count

Assert-CleanWorkingTree -Context "completed audit report generation"
$currentHead = (git rev-parse HEAD).Trim()
$currentBranchAfter = (git branch --show-current).Trim()
if ($currentHead -ne $sourceCommit -or $currentBranchAfter -ne $currentBranch) {
    throw "Source identity changed while audit reports were generated."
}

Write-Host "`nDEMONSTRATOR AUDIT REPORTS: GENERATED"
Write-Host "Public/history report: $resolvedRoot\$publicReport"
Write-Host "License inventory:     $resolvedRoot\$licenseReport"
Write-Host "Review ledger:         $resolvedRoot\$reviewLedger"
Write-Host "Integration proof:     $resolvedRoot\$integrationReport"
Write-Host "Public contracts:      $($publicData.metrics.presentPublicContracts)/$($publicData.metrics.requiredPublicContracts)"
Write-Host "Public blockers:       $(@($publicData.blockers).Count)"
Write-Host "Review findings:       $(@($publicData.reviewFindings).Count)"
Write-Host "Review pending:        $pendingReviews"
Write-Host "Review remediation:    $remediationReviews"
Write-Host "License status:        $($licenseData.status)"
Write-Host "origin/main base:       $($integrationData.baseCommit)"
Write-Host "Candidate ahead:       $($integrationData.candidateAhead)"
Write-Host "Candidate behind:      $($integrationData.candidateBehind)"
Write-Host "Fast-forward possible: $($integrationData.fastForwardPossible)"
Write-Host "Publication:           NOT PERFORMED"
Write-Host "Interpretation:         findings, GitHub UI surfaces and owner decisions remain separate"
Write-Host "SOURCE-PUBLIC-READY:    NOT CLAIMED"
