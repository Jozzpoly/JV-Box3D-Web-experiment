param(
    [switch]$StartLanPreview
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$expectedBranch = "agent/jv-web-demonstrator-foundation"
$receiptPath = "public/receipts/jv_m6_factory_receipt.json"
$manifestPath = "dist/build-manifest.json"
$previewPort = 4173

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
        Write-Host "Working tree changes detected during ${Context}:"
        $changes | ForEach-Object { Write-Host "  $_" }
        throw "The demonstrator gate requires a clean working tree. Nothing was deleted or reset."
    }
}

function Assert-SourceIdentity {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Context,
        [Parameter(Mandatory = $true)]
        [string]$ExpectedBranch,
        [Parameter(Mandatory = $true)]
        [string]$ExpectedCommit
    )

    $branch = (git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne $ExpectedBranch) {
        throw "Branch changed during ${Context}. Expected '$ExpectedBranch', received '$branch'."
    }
    $commit = (git rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or $commit -ne $ExpectedCommit) {
        throw "HEAD changed during ${Context}. Expected '$ExpectedCommit', received '$commit'."
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

$sourceBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceBranch -ne $expectedBranch) {
    throw "Wrong branch. Expected '$expectedBranch', received '$sourceBranch'."
}
$sourceCommit = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceCommit -notmatch '^[0-9a-f]{40}$') {
    throw "Unable to resolve the exact 40-character source commit."
}

Assert-CleanWorkingTree -Context "initial source check"

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
Write-Host "Branch:     $sourceBranch"
Write-Host "Commit:     $sourceCommit"
Write-Host "Node:       $nodeVersion"
Write-Host "npm:        $npmVersion"

if (-not (Test-Path $receiptPath -PathType Leaf)) {
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
Assert-SourceIdentity -Context "receipt verification" -ExpectedBranch $sourceBranch -ExpectedCommit $sourceCommit
Assert-CleanWorkingTree -Context "receipt verification"

Invoke-NpmStep "Install exact dependency graph" @("ci")
Invoke-NpmStep "Audit local Markdown links" @("run", "check:docs")
Invoke-NpmStep "Run TypeScript, tests and third-party verification" @("run", "check")
Invoke-NpmStep "Build and validate the portable artifact candidate" @("run", "build:portable")

Assert-SourceIdentity -Context "completed foundation gate" -ExpectedBranch $sourceBranch -ExpectedCommit $sourceCommit
Assert-CleanWorkingTree -Context "completed foundation gate"

if (-not (Test-Path $manifestPath -PathType Leaf)) {
    throw "Portable build did not produce $manifestPath."
}
$manifest = Get-Content -Raw -Path $manifestPath | ConvertFrom-Json
if ($null -eq $manifest.schemaVersion -or $manifest.schemaVersion -ne 1) {
    throw "Portable build manifest schema is missing or unsupported."
}
if ($manifest.source.commit -ne $sourceCommit) {
    throw "Portable manifest source commit mismatch. Expected $sourceCommit, received $($manifest.source.commit)."
}
if ($manifest.source.workingTreeClean -ne $true) {
    throw "Portable manifest does not record a clean source tree."
}
if (
    $manifest.publication.publicReady -ne $false -or
    $manifest.publication.pagesPublicationApproved -ne $false -or
    $manifest.publication.publishedByBuild -ne $false
) {
    throw "Portable manifest illegally elevates publication state."
}

Write-Host "`nDEMONSTRATOR FOUNDATION GATE: PASS"
Write-Host "Source:      $sourceCommit"
Write-Host "Artifact:    $resolvedRoot\dist"
Write-Host "Publication: NOT PERFORMED"
Write-Host "Source-public audit remains separate and is expected to block until all contracts and owner decisions exist."

if ($StartLanPreview) {
    Write-Host "`nStarting the validated dist package on an explicitly requested LAN preview."
    Write-Host "No firewall rule, repository setting or internet deployment will be changed."
    Write-Host "Desktop: http://localhost:$previewPort/"

    try {
        $addresses = @(
            Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
                Where-Object {
                    $_.IPAddress -notlike "127.*" -and
                    $_.IPAddress -notlike "169.254.*" -and
                    $_.AddressState -eq "Preferred"
                } |
                Select-Object -ExpandProperty IPAddress -Unique
        )
        foreach ($address in $addresses) {
            Write-Host "Phone/LAN candidate: http://${address}:$previewPort/"
        }
    }
    catch {
        Write-Host "Could not enumerate LAN addresses automatically. The preview can still run."
    }

    Write-Host "Stop the preview with Ctrl+C."
    npm run preview -- --host 0.0.0.0 --port $previewPort --strictPort
    exit $LASTEXITCODE
}
