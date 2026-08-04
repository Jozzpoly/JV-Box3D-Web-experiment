param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$receiptPath = "public/receipts/jv_m6_factory_receipt.json"
$manifestPath = "dist/build-manifest.json"

function Invoke-NpmStep {
    param(
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    Write-Host "`n==> $Label"
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

function Assert-CleanTree {
    param([string]$Context)

    $changes = @(git status --porcelain --untracked-files=all)
    if ($LASTEXITCODE -ne 0) {
        throw "git status failed during $Context."
    }
    if ($changes.Count -gt 0) {
        $changes | ForEach-Object { Write-Host "  $_" }
        throw "The gate requires a clean working tree during $Context. Nothing was reset or deleted."
    }
}

$repoRoot = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "This directory is not a Git repository."
}
$resolvedRoot = [System.IO.Path]::GetFullPath($root).TrimEnd('\', '/')
$resolvedRepoRoot = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd('\', '/')
if ($resolvedRoot -ne $resolvedRepoRoot) {
    throw "Repository root mismatch: $resolvedRoot != $resolvedRepoRoot"
}

$sourceBranch = (git branch --show-current).Trim()
$sourceCommit = (git rev-parse HEAD).Trim()
if ($sourceCommit -notmatch '^[0-9a-f]{40}$') {
    throw "Unable to resolve the exact source commit."
}
Assert-CleanTree "the initial check"

$nodeVersion = (node --version).Trim()
if ($LASTEXITCODE -ne 0 -or $nodeVersion -notmatch '^v24\.') {
    throw "Node 24 is required. Received '$nodeVersion'."
}
$npmVersion = (npm --version).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "npm is unavailable."
}

if (-not (Test-Path $receiptPath -PathType Leaf)) {
    throw "Missing pinned receipt: $receiptPath"
}
$expectedReceiptBlob = (git rev-parse "HEAD:$receiptPath").Trim()
$actualReceiptBlob = (git hash-object --no-filters $receiptPath).Trim()
if ($expectedReceiptBlob -ne $actualReceiptBlob) {
    throw "Pinned receipt bytes differ from Git. Expected $expectedReceiptBlob, received $actualReceiptBlob. Run tools/repair-windows-receipt.ps1 and inspect the result."
}

Write-Host "Repository: $resolvedRepoRoot"
Write-Host "Branch:     $sourceBranch"
Write-Host "Commit:     $sourceCommit"
Write-Host "Node:       $nodeVersion"
Write-Host "npm:        $npmVersion"
Write-Host "Receipt:    $actualReceiptBlob (byte-exact)"

Invoke-NpmStep "Install exact dependency graph" @("ci")
Invoke-NpmStep "Run checks and build the portable package" @("run", "build")

Assert-CleanTree "the completed build"
$currentCommit = (git rev-parse HEAD).Trim()
$currentBranch = (git branch --show-current).Trim()
if ($currentCommit -ne $sourceCommit -or $currentBranch -ne $sourceBranch) {
    throw "Source identity changed while the gate was running."
}

if (-not (Test-Path $manifestPath -PathType Leaf)) {
    throw "Portable build did not produce $manifestPath."
}
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
if ($manifest.source.commit -ne $sourceCommit) {
    throw "Portable manifest source mismatch: $($manifest.source.commit) != $sourceCommit"
}
if ($manifest.source.workingTreeClean -ne $true) {
    throw "Portable manifest does not record a clean source tree."
}

Write-Host "`nJV WEB FOUNDATION GATE: PASS"
Write-Host "Source:   $sourceCommit"
Write-Host "Artifact: $resolvedRoot\dist"
Write-Host "Publish:  NOT PERFORMED"
