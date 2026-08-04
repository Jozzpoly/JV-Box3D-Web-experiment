param(
    [switch]$StartLanPreview
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$expectedBranch = "agent/jv-web-demonstrator-foundation"
$receiptPath = "public/receipts/jv_m6_factory_receipt.json"
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

$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) {
    throw "git status failed."
}
if ($dirty.Count -gt 0) {
    Write-Host "Working tree changes:"
    $dirty | ForEach-Object { Write-Host "  $_" }
    throw "The demonstrator gate requires a clean working tree. Nothing was modified."
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

Invoke-NpmStep "Install exact dependency graph" @("ci")
Invoke-NpmStep "Audit local Markdown links" @("run", "check:docs")
Invoke-NpmStep "Run TypeScript and tests" @("run", "check")
Invoke-NpmStep "Build and validate portable Pages-ready artifact" @("run", "build:portable")

Write-Host "`nDEMONSTRATOR FOUNDATION GATE: PASS"
Write-Host "Artifact: $resolvedRoot\dist"
Write-Host "Publication: NOT PERFORMED"
Write-Host "Public-ready audit: run separately with 'npm run audit:public'"

if ($StartLanPreview) {
    Write-Host "`nStarting the validated dist package on the local network only."
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
