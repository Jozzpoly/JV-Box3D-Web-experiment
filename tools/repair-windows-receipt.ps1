$ErrorActionPreference = "Stop"

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

$receiptPath = "public/receipts/jv_m6_factory_receipt.json"

Write-Host "[JV F5] Restoring the byte-pinned receipt with repository attributes..."
if (Test-Path $receiptPath) {
  Remove-Item -Force $receiptPath
}

git restore --source=HEAD --worktree -- $receiptPath
if ($LASTEXITCODE -ne 0) {
  throw "git restore failed with exit code $LASTEXITCODE"
}

$expected = (git rev-parse "HEAD:$receiptPath").Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not read the pinned receipt blob from HEAD."
}

$actual = (git hash-object --no-filters $receiptPath).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "Could not hash the restored receipt."
}

if ($actual -ne $expected) {
  throw "Receipt bytes still differ after restore. Expected $expected, received $actual."
}

Write-Host "[JV F5] Receipt OK: $actual"
Write-Host "[JV F5] Running the local validation gate..."

npm run check
if ($LASTEXITCODE -ne 0) {
  throw "npm run check failed with exit code $LASTEXITCODE"
}

Write-Host "[JV F5] Validation passed. Starting Vite..."
npm run dev
