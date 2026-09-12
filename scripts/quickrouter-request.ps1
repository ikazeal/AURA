param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$BodyPath,
  [Parameter(Mandatory = $true)][string]$ContentType
)

$token = if ($env:QUICKROUTER_API_KEY) { $env:QUICKROUTER_API_KEY } else { $env:OPENAI_API_KEY }
$body = [System.IO.File]::ReadAllBytes($BodyPath)
$status = 502
$content = '{"error":"AI_PROXY_FAILED"}'
for ($attempt = 1; $attempt -le 5; $attempt++) {
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ Authorization = "Bearer $token"; Accept = 'application/json' } -ContentType $ContentType -Body $body -TimeoutSec 180
    $status = [int]$response.StatusCode
    $content = $response.Content
    break
  } catch {
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    if ($_.ErrorDetails.Message) { $content = $_.ErrorDetails.Message }
    if ($attempt -lt 5) { Start-Sleep -Seconds ([Math]::Min(8, 2 * $attempt)) }
  }
}
[Console]::Out.Write($content)
[Console]::Out.Write("`n__AURA_STATUS__$status")
