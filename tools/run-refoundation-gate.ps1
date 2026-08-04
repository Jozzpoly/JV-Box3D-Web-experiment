param(
    [switch]$StartDev
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$expectedBranch = "agent/jv-web-refoundation"
$receiptPath = "public/receipts/jv_m6_factory_receipt.json"

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host "`n==> $Label"
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

$repoRoot = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "This directory is not a Git repository."
}

$resolvedRoot = [System.IO.Path]::GetFullPath($root).TrimEnd('\', '/')
$resolvedRepoRoot = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd('\', '/')
if ($resolvedRoot -ne $resolvedRepoRoot) {
    throw "Repository root mismatch. Script root: $resolvedRoot; Git root: $resolvedRepoRoot"
}

$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $currentBranch -ne $expectedBranch) {
    throw "Wrong branch. Expected '$expectedBranch', received '$currentBranch'."
}

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) {
    throw "git status failed."
}
if ($dirty.Count -gt 0) {
    Write-Host "Working tree changes:"
    $dirty | ForEach-Object { Write-Host "  $_" }
    throw "The refoundation gate requires a clean working tree. Nothing was modified."
}

$nodeVersion = (node --version).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Node.js is unavailable."
}
if ($nodeVersion -notmatch '^v24\.') {
    throw "Node 24 is required. Received $nodeVersion."
}
$npmVersion = (npm --version).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "npm is unavailable."
}

Write-Host "Repository: $resolvedRepoRoot"
Write-Host "Branch:     $currentBranch"
Write-Host "Commit:     $((git rev-parse --short=12 HEAD).Trim())"
Write-Host "Node:       $nodeVersion"
Write-Host "npm:        $npmVersion"

if (-not (Test-Path $receiptPath)) {
    throw "Missing pinned receipt: $receiptPath"
}

$expectedReceiptBlob = (git rev-parse "HEAD:$receiptPath").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Unable to resolve the receipt blob stored in Git."
}
$actualReceiptBlob = (git hash-object --no-filters $receiptPath).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Unable to hash the checked-out receipt bytes."
}

if ($expectedReceiptBlob -ne $actualReceiptBlob) {
    Write-Host "Pinned receipt bytes differ from Git; restoring the tracked artifact once."
    Remove-Item -Force $receiptPath
    git restore --source=HEAD --worktree -- $receiptPath
    if ($LASTEXITCODE -ne 0) {
        throw "Receipt restore failed."
    }
    $actualReceiptBlob = (git hash-object --no-filters $receiptPath).Trim()
    if ($LASTEXITCODE -ne 0 -or $expectedReceiptBlob -ne $actualReceiptBlob) {
        throw "Receipt bytes still differ after restore. Expected $expectedReceiptBlob, received $actualReceiptBlob."
    }
}

Write-Host "Receipt:    $actualReceiptBlob (byte-exact)"

Invoke-Checked "Install exact dependency graph" { npm ci }
Invoke-Checked "Audit local Markdown links" { npm run check:docs }
Invoke-Checked "Run TypeScript and test gate" { npm run check }
Invoke-Checked "Build production bundle" { npm run build }

Write-Host "`nREFOUNDATION LOCAL GATE: PASS"

if ($StartDev) {
    Write-Host "`nStarting Vite. Stop it with Ctrl+C."
    npm run dev
    exit $LASTEXITCODE
}
