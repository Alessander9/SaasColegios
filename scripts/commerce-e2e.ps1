param(
  [string]$BaseUrl = 'http://localhost:3100/api/v1',
  [string]$ParentEmail = 'padre.garcia@email.com',
  [string]$ParentPassword = 'Cole2026!',
  [string]$DirectorEmail = 'director@sanjose.edu.pe',
  [string]$DirectorPassword = 'Cole2026!'
)

$ErrorActionPreference = 'Stop'

function Invoke-JsonRequest {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )

  $params = @{
    Method = $Method
    Uri = $Uri
    Headers = $Headers
    ContentType = 'application/json'
  }
  if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
  Invoke-RestMethod @params
}

$parent = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/auth/login" -Body @{ email = $ParentEmail; password = $ParentPassword }
$parentHeaders = @{ Authorization = "Bearer $($parent.accessToken)" }
$products = Invoke-JsonRequest -Method Get -Uri "$BaseUrl/commerce/products" -Headers $parentHeaders
$students = Invoke-JsonRequest -Method Get -Uri "$BaseUrl/students/mine" -Headers $parentHeaders

if ($products.Count -lt 1 -or $products[0].variants.Count -lt 1) { throw 'Commerce catalog is empty' }
if ($students.Count -lt 1) { throw 'Parent has no linked students' }

$variant = $products[0].variants[0]
$student = $students[0]
$idempotencyKey = "e2e-commerce-$([guid]::NewGuid().ToString())"
$checkoutBody = @{
  studentId = $student.id
  items = @(@{ variantId = $variant.id; quantity = 1 })
  idempotencyKey = $idempotencyKey
  deliveryMethod = 'PICKUP_AT_SCHOOL'
}

$order = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/commerce/orders/checkout" -Headers $parentHeaders -Body $checkoutBody
if ($null -eq $order.id) { throw "Checkout response missing order id: $($order | ConvertTo-Json -Depth 5)" }
$replay = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/commerce/orders/checkout" -Headers $parentHeaders -Body $checkoutBody
if ([string]$order.id -ne [string]$replay.id) { throw "Checkout idempotency invariant failed: $($order.id) != $($replay.id)" }
if ($order.status -ne 'PAID') { throw "Expected PAID order, got $($order.status)" }

$director = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/auth/login" -Body @{ email = $DirectorEmail; password = $DirectorPassword }
$directorHeaders = @{ Authorization = "Bearer $($director.accessToken)" }
$updated = Invoke-JsonRequest -Method Patch -Uri "$BaseUrl/commerce/orders/$($order.id)/status" -Headers $directorHeaders -Body @{ status = 'PREPARING' }
if ($updated.status -ne 'PREPARING') { throw "Expected PREPARING order, got $($updated.status)" }

[pscustomobject]@{
  orderCode = $order.code
  orderId = $order.id
  studentId = $student.id
  variantId = $variant.id
  statusAfterCheckout = [string]$order.status
  replaySameOrder = ([string]$order.id -eq [string]$replay.id)
  statusAfterAdminProcessing = [string]$updated.status
} | ConvertTo-Json
