param([string]$BaseUrl = 'http://localhost:3100/api/v1')

$ErrorActionPreference = 'Stop'
$body = @{ email = 'padre.garcia@email.com'; password = 'Cole2026!' } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body $body
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
$product = Invoke-RestMethod -Uri "$BaseUrl/commerce/products" -Headers $headers | Select-Object -First 1
$student = Invoke-RestMethod -Uri "$BaseUrl/students/mine" -Headers $headers | Select-Object -First 1
$variant = $product.variants[0]
$key = "concurrency-$([guid]::NewGuid())"
$payload = @{ studentId = $student.id; items = @(@{ variantId = $variant.id; quantity = 1 }); idempotencyKey = $key; deliveryMethod = 'PICKUP_AT_SCHOOL' } | ConvertTo-Json -Depth 5

$jobs = 1..5 | ForEach-Object {
  Start-Job -ScriptBlock {
    param($uri, $requestHeaders, $requestBody)
    Invoke-RestMethod -Method Post -Uri $uri -Headers $requestHeaders -ContentType 'application/json' -Body $requestBody
  } -ArgumentList "$BaseUrl/commerce/orders/checkout", $headers, $payload
}
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
$ids = @($results | ForEach-Object { $_.id } | Select-Object -Unique)
if ($ids.Count -ne 1) { throw "Expected one idempotent order, got $($ids.Count)" }
Write-Output ([pscustomobject]@{ requests = 5; uniqueOrders = [int]$ids.Count; orderId = [string]$ids[0] } | ConvertTo-Json)
