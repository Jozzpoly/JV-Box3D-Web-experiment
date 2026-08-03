$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$expectedBranch = "agent/f5-visual-observer"
$currentBranch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not determine the current Git branch."
}
if ($currentBranch -ne $expectedBranch) {
  throw "Expected branch '$expectedBranch', but current branch is '$currentBranch'."
}

$workingTree = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw "Could not inspect the working tree."
}
if ($workingTree) {
  throw "The working tree is not clean. Nothing was changed. Review 'git status' before continuing."
}

$receiptPath = "public/receipts/jv_m6_factory_receipt.json"
Write-Host "[JV F5 Visual] Restoring the byte-pinned native receipt..."
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
$actualReceipt = (git hash-object --no-filters $receiptPath).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not hash the restored receipt."
}
if ($actualReceipt -ne $expectedReceipt) {
  throw "Receipt bytes differ. Expected $expectedReceipt, received $actualReceipt."
}
Write-Host "[JV F5 Visual] Receipt OK: $actualReceipt"

Write-Host "[JV F5 Visual] Installing the locked dependencies..."
npm ci
if ($LASTEXITCODE -ne 0) {
  throw "npm ci failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5 Visual] Running TypeScript, real WASM tests and production build once..."
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "npm run build failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5 Visual] Validation passed. Starting the visual observer..."
Write-Host "[JV F5 Visual] Open http://localhost:5173/ and use A/D. Drag the scene to orbit; use the mouse wheel to zoom."
npm run dev
