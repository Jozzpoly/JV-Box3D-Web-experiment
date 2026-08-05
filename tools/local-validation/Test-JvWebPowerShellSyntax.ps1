[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$relativeFiles = @(
    'tools/local-validation/Test-JvWebPowerShellSyntax.ps1',
    'tools/local-validation/Test-JvWebControlPlane.ps1',
    'tools/local-validation/Invoke-JvWebBaseline.ps1',
    'tools/playable-recovery/Start-JvWebPlayable.ps1',
    'tools/playable-recovery/Launch-JvWebPlayable.ps1',
    'tools/playable-recovery/Run-JvWebPlayable.ps1'
)

$failures = New-Object 'System.Collections.Generic.List[string]'

foreach ($relativePath in $relativeFiles) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $failures.Add(('Missing PowerShell file: {0}' -f $relativePath))
        continue
    }

    $tokens = $null
    $parseErrors = $null
    [System.Management.Automation.Language.Parser]::ParseFile(
        $fullPath,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    foreach ($parseError in @($parseErrors)) {
        $failures.Add(('{0}: line {1}, column {2}: {3}' -f
            $relativePath,
            $parseError.Extent.StartLineNumber,
            $parseError.Extent.StartColumnNumber,
            $parseError.Message
        ))
    }
}

if ($failures.Count -gt 0) {
    Write-Host 'JV WEB POWERSHELL SYNTAX CHECK: FAIL'
    foreach ($failure in $failures) {
        Write-Host (' - {0}' -f $failure)
    }
    exit 1
}

Write-Host 'JV WEB POWERSHELL SYNTAX CHECK: PASS'
Write-Host 'All recovery and local-validation scripts parse in the current PowerShell engine.'
exit 0
