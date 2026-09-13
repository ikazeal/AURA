param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Method,
  [Parameter(Mandatory = $true)][string]$BodyPath,
  [Parameter(Mandatory = $true)][string]$ContentType
)

$status = 502
$content = '{"error":"VERCEL_REQUEST_FAILED"}'
try {
  if ($Method -eq 'GET') {
    $response = Invoke-WebRequest -Uri $Url -Method Get -Headers @{ Accept = 'application/json' } -TimeoutSec 300
  } else {
    $body = [System.IO.File]::ReadAllBytes($BodyPath)
    $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers @{ Accept = 'application/json' } -ContentType $ContentType -Body $body -TimeoutSec 300
  }
  $status = [int]$response.StatusCode
  $content = $response.Content
} catch {
  if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
  if ($_.ErrorDetails.Message) { $content = $_.ErrorDetails.Message }
}
[Console]::Out.Write($content)
[Console]::Out.Write("`n__AURA_STATUS__$status")
