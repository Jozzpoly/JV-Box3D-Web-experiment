$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$expectedBranch = "agent/f5-minimal-drive"
$receiptPath = "public/receipts/jv_m6_factory_receipt.json"
$allowedReceiptDriftPattern = '^ M public/receipts/jv_m6_factory_receipt\.json$'

$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not determine the current Git branch."
}
if ($currentBranch -ne $expectedBranch) {
  throw "Expected branch '$expectedBranch', but current branch is '$currentBranch'."
}

$statusLines = @(git status --porcelain=v1 --untracked-files=all)
if ($LASTEXITCODE -ne 0) {
  throw "Could not inspect the working tree."
}

$otherChanges = @(
  $statusLines | Where-Object {
    $_ -and ($_ -notmatch $allowedReceiptDriftPattern)
  }
)
if ($otherChanges.Count -gt 0) {
  Write-Host "[JV F5 Drive] Unrelated local changes were found; nothing was changed:" -ForegroundColor Yellow
  $otherChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
  throw "The working tree contains changes other than the known unstaged Windows receipt drift."
}

if ($statusLines.Count -gt 0) {
  Write-Host "[JV F5 Drive] Known Windows receipt drift detected. Restoring only the pinned receipt..."
} else {
  Write-Host "[JV F5 Drive] Restoring the byte-pinned native receipt..."
}

if (Test-Path $receiptPath) {
  Remove-Item -Force $receiptPath
}
git restore --source=HEAD --worktree -- $receiptPath
if ($LASTEXITCODE -ne 0) {
  throw "git restore failed with exit code $LASTEXITCODE"
}

$expectedReceipt = (git rev-parse "HEAD:$receiptPath").Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not read the pinned receipt blob from HEAD."
}
$indexReceipt = (git rev-parse ":$receiptPath").Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not read the pinned receipt blob from the Git index."
}
$actualReceipt = (git hash-object --no-filters $receiptPath).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not hash the restored receipt."
}

if ($indexReceipt -ne $expectedReceipt) {
  throw "The receipt in the Git index differs from HEAD. Expected $expectedReceipt, received $indexReceipt. No staged data was changed."
}
if ($actualReceipt -ne $expectedReceipt) {
  throw "Receipt bytes differ after restore. Expected $expectedReceipt, received $actualReceipt."
}

git update-index --refresh -- $receiptPath 2>$null | Out-Null

$remainingChanges = @(git status --porcelain=v1 --untracked-files=all)
if ($LASTEXITCODE -ne 0) {
  throw "Could not verify the working tree after restoring the receipt."
}
$remainingOtherChanges = @(
  $remainingChanges | Where-Object {
    $_ -and ($_ -notmatch $allowedReceiptDriftPattern)
  }
)
if ($remainingOtherChanges.Count -gt 0) {
  Write-Host "[JV F5 Drive] Unrelated changes remain after the safe receipt repair:" -ForegroundColor Yellow
  $remainingOtherChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
  throw "Validation stopped before npm commands."
}

Write-Host "[JV F5 Drive] Receipt bytes and Git index are exact: $actualReceipt"
if ($remainingChanges.Count -gt 0) {
  Write-Host "[JV F5 Drive] Git still reports only the known receipt stat/EOL false-positive; continuing because HEAD, index and on-disk hashes are identical." -ForegroundColor Yellow
} else {
  Write-Host "[JV F5 Drive] Working tree clean."
}

Write-Host "[JV F5 Drive] Installing the locked dependencies..."
npm ci
if ($LASTEXITCODE -ne 0) {
  throw "npm ci failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5 Drive] Running TypeScript, real WASM tests and production build once..."
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "npm run build failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5 Drive] Validation passed. Starting the minimal physical drive..."
Write-Host "[JV F5 Drive] Open http://localhost:5173/"
Write-Host "[JV F5 Drive] A/D = steering, W/S = forward/reverse, Space = brake, mouse drag = orbit, wheel = zoom."
npm run dev
