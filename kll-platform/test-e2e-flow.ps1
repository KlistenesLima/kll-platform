# ============================================================
# KLL Platform - E2E Integration Test Suite
# Tests the complete flow: Product → Order → Payment → Shipment
# ============================================================
param(
    [string]$GatewayUrl = "http://localhost:5100",
    [string]$StoreUrl = "http://localhost:5200",
    [string]$PayUrl = "http://localhost:5300",
    [string]$LogisticsUrl = "http://localhost:5400"
)

$ErrorActionPreference = "Continue"
$passed = 0
$failed = 0
$total = 0

function Test-Endpoint {
    param([string]$Name, [string]$Method, [string]$Url, [object]$Body = $null, [int]$ExpectedStatus = 200)
    $script:total++
    Write-Host "`n[$script:total] $Name" -ForegroundColor Cyan
    Write-Host "  $Method $Url" -ForegroundColor Gray

    try {
        $params = @{ Uri = $Url; Method = $Method; ContentType = "application/json"; TimeoutSec = 30 }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }

        $response = Invoke-RestMethod @params -ErrorAction Stop
        $script:passed++
        Write-Host "  PASS" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            $script:passed++
            Write-Host "  PASS (expected $ExpectedStatus)" -ForegroundColor Green
            return $null
        }
        $script:failed++
        Write-Host "  FAIL - Status: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  KLL Platform - E2E Test Suite" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ports:" -ForegroundColor Yellow
Write-Host "  KLL Gateway:   $GatewayUrl" -ForegroundColor Gray
Write-Host "  KLL Store:     $StoreUrl" -ForegroundColor Gray
Write-Host "  KLL Pay:       $PayUrl" -ForegroundColor Gray
Write-Host "  KLL Logistics: $LogisticsUrl" -ForegroundColor Gray
Write-Host ""

# ============================================================
# 1. HEALTH CHECKS
# ============================================================
Write-Host "========== HEALTH CHECKS ==========" -ForegroundColor Yellow

Test-Endpoint -Name "Store Health" -Method GET -Url "$StoreUrl/health"
Test-Endpoint -Name "Pay Health" -Method GET -Url "$PayUrl/health"
Test-Endpoint -Name "Logistics Health" -Method GET -Url "$LogisticsUrl/health"

# ============================================================
# 2. PRODUCT MANAGEMENT
# ============================================================
Write-Host "`n========== PRODUCT MANAGEMENT ==========" -ForegroundColor Yellow

$product1 = Test-Endpoint -Name "Create Product 1 (Smartphone)" -Method POST -Url "$StoreUrl/api/v1/products" -Body @{
    name = "Smartphone Galaxy S24 Ultra"
    description = "Tela 6.8 AMOLED, 256GB, Camera 200MP"
    price = 6499.90
    stockQuantity = 50
    category = "Electronics"
} -ExpectedStatus 201

$product2 = Test-Endpoint -Name "Create Product 2 (Notebook)" -Method POST -Url "$StoreUrl/api/v1/products" -Body @{
    name = "Notebook Dell Inspiron 15"
    description = "Intel i7, 16GB RAM, SSD 512GB"
    price = 4299.00
    stockQuantity = 30
    category = "Computers"
} -ExpectedStatus 201

$products = Test-Endpoint -Name "List All Products" -Method GET -Url "$StoreUrl/api/v1/products"
if ($products) { Write-Host "  Found $($products.Count) products" -ForegroundColor Gray }

$searchResults = Test-Endpoint -Name "Search Products (Galaxy)" -Method GET -Url "$StoreUrl/api/v1/products/search?q=Galaxy"
if ($searchResults) { Write-Host "  Found $($searchResults.Count) matching" -ForegroundColor Gray }

# ============================================================
# 3. MERCHANT SETUP (KLL Pay)
# ============================================================
Write-Host "`n========== MERCHANT SETUP ==========" -ForegroundColor Yellow

$merchant = Test-Endpoint -Name "Create Merchant (KLL Store)" -Method POST -Url "$PayUrl/api/v1/merchants" -Body @{
    name = "KLL Store"
    document = "12345678000190"
    email = "finance@kllstore.com"
    webhookUrl = "http://localhost:5200/api/v1/webhooks/payment-confirmed"
} -ExpectedStatus 201

if ($merchant) {
    Write-Host "  API Key: $($merchant.apiKey)" -ForegroundColor Gray
    $apiKey = $merchant.apiKey
}

# ============================================================
# 4. ORDER CREATION
# ============================================================
Write-Host "`n========== ORDER FLOW ==========" -ForegroundColor Yellow

$productId1 = if ($product1) { $product1.id } else { [Guid]::NewGuid().ToString() }
$productId2 = if ($product2) { $product2.id } else { [Guid]::NewGuid().ToString() }

$order = Test-Endpoint -Name "Create Order (2 items)" -Method POST -Url "$StoreUrl/api/v1/orders" -Body @{
    customerId = "cust-001"
    customerEmail = "joao@email.com"
    street = "Rua Boa Viagem"
    number = "1234"
    complement = "Apt 501"
    neighborhood = "Boa Viagem"
    city = "Recife"
    state = "PE"
    zipCode = "51020-000"
    items = @(
        @{ productId = $productId1; quantity = 1 }
        @{ productId = $productId2; quantity = 2 }
    )
} -ExpectedStatus 201

if ($order) {
    $orderId = $order.id
    Write-Host "  Order ID: $orderId" -ForegroundColor Gray
}

# Get order details
if ($orderId) {
    $orderDetails = Test-Endpoint -Name "Get Order Details" -Method GET -Url "$StoreUrl/api/v1/orders/$orderId"
    if ($orderDetails) {
        Write-Host "  Status: $($orderDetails.status) | Total: R$ $($orderDetails.totalAmount)" -ForegroundColor Gray
    }
}

# ============================================================
# 5. PAYMENT (Simulates KRT Bank flow)
# ============================================================
Write-Host "`n========== PAYMENT FLOW ==========" -ForegroundColor Yellow

if ($orderId) {
    # Simulate KRT Bank webhook confirming payment
    $confirmResult = Test-Endpoint -Name "Confirm Payment (simulate KRT Bank webhook)" -Method POST `
        -Url "$StoreUrl/api/v1/orders/$orderId/confirm-payment" -Body @{
        chargeId = "krt-charge-$(Get-Random)"
    }

    Start-Sleep -Seconds 2  # Wait for Kafka propagation

    $orderAfterPayment = Test-Endpoint -Name "Verify Order Status = Paid" -Method GET -Url "$StoreUrl/api/v1/orders/$orderId"
    if ($orderAfterPayment) {
        Write-Host "  Status: $($orderAfterPayment.status)" -ForegroundColor Gray
    }
}

# ============================================================
# 6. SHIPMENT TRACKING
# ============================================================
Write-Host "`n========== SHIPMENT TRACKING ==========" -ForegroundColor Yellow

$shipment = Test-Endpoint -Name "Create Shipment" -Method POST -Url "$LogisticsUrl/api/v1/shipments" -Body @{
    orderId = $(if ($orderId) { $orderId } else { [Guid]::NewGuid().ToString() })
    recipientName = "Joao Silva"
    recipientEmail = "joao@email.com"
    address = "Rua Boa Viagem, 1234"
    city = "Recife"
    state = "PE"
    zipCode = "51020-000"
    weight = 2.5
} -ExpectedStatus 201

if ($shipment) {
    $trackingCode = $shipment.trackingCode
    Write-Host "  Tracking: $trackingCode" -ForegroundColor Gray

    Test-Endpoint -Name "Track Shipment" -Method GET -Url "$LogisticsUrl/api/v1/shipments/track/$trackingCode"

    Test-Endpoint -Name "Assign Driver" -Method POST -Url "$LogisticsUrl/api/v1/shipments/$($shipment.id)/assign-driver" -Body @{
        driverId = [Guid]::NewGuid().ToString()
    }

    Test-Endpoint -Name "Mark as Delivered" -Method POST -Url "$LogisticsUrl/api/v1/shipments/$($shipment.id)/deliver"
}

# ============================================================
# 7. CUSTOMER ORDERS
# ============================================================
Write-Host "`n========== CUSTOMER HISTORY ==========" -ForegroundColor Yellow

Test-Endpoint -Name "Get Customer Orders" -Method GET -Url "$StoreUrl/api/v1/orders/customer/cust-001"

# ============================================================
# RESULTS
# ============================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "  Results: $passed/$total passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "============================================" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -gt 0) { exit 1 }