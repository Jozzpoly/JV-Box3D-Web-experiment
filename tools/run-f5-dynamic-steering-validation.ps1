$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$expectedBranch = "agent/f5-dynamic-steering-validation"
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
  Write-Host "[JV F5 Dynamic] Unrelated local changes were found; nothing was changed:" -ForegroundColor Yellow
  $otherChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
  throw "The working tree contains changes other than the known unstaged Windows receipt drift."
}

if (Test-Path $receiptPath) {
  Remove-Item -Force $receiptPath
}
git restore --source=HEAD --worktree -- $receiptPath
if ($LASTEXITCODE -ne 0) {
  throw "git restore failed with exit code $LASTEXITCODE"
}

$expectedReceipt = (git rev-parse "HEAD:$receiptPath").Trim()
$indexReceipt = (git rev-parse ":$receiptPath").Trim()
$actualReceipt = (git hash-object --no-filters $receiptPath).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not validate the pinned receipt hashes."
}
if ($indexReceipt -ne $expectedReceipt) {
  throw "The receipt in the Git index differs from HEAD. Expected $expectedReceipt, received $indexReceipt."
}
if ($actualReceipt -ne $expectedReceipt) {
  throw "Receipt bytes differ after restore. Expected $expectedReceipt, received $actualReceipt."
}

git update-index --refresh -- $receiptPath 2>$null | Out-Null
$remainingChanges = @(git status --porcelain=v1 --untracked-files=all)
$remainingOtherChanges = @(
  $remainingChanges | Where-Object {
    $_ -and ($_ -notmatch $allowedReceiptDriftPattern)
  }
)
if ($remainingOtherChanges.Count -gt 0) {
  Write-Host "[JV F5 Dynamic] Unrelated changes remain after receipt repair:" -ForegroundColor Yellow
  $remainingOtherChanges | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
  throw "Validation stopped before npm commands."
}

Write-Host "[JV F5 Dynamic] Receipt exact: $actualReceipt"
Write-Host "[JV F5 Dynamic] Running TypeScript, the complete WASM suite and dynamic rack-excursion diagnostics..."
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "npm run build failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5 Dynamic] Validation passed. Read the diagnostic lines for rack excess in millimetres."
Write-Host "[JV F5 Dynamic] Starting the same physical drive observer for optional manual comparison..."
npm run dev
