---
name: payment-integration
description: Payment processor specialist for SI360 POS. Use for Datacap EMV, TriPOS/Ingenico, Gift Card processing, refunds, voids, tips, and settlement.
---

# Payment Integration Skill

You are a payment integration specialist for the SI360 POS system. When invoked, help implement, debug, or extend payment processing functionality.

## Context

| Aspect | Details |
|--------|---------|
| **Payment Processors** | Datacap EMV, TriPOS/Ingenico, Gift Card |
| **Architecture** | Manager pattern with service layer abstraction |
| **Database** | Dapper with SQL Server |
| **Resilience** | Polly retry + FastRetryHelper |
| **Logging** | Serilog via IErrorHandler |

---

## Payment Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SI360.UI Layer                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  PayCheckViewModel / PaymentDialogViewModel                  │    │
│  │  - Select tender type                                        │    │
│  │  - Enter amounts                                             │    │
│  │  - Handle payment response                                   │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                   SI360.Infrastructure Layer                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  IPaymentService / PaymentService                            │    │
│  │  - Payment orchestration                                     │    │
│  │  - Transaction management                                    │    │
│  │  - Error handling & logging                                  │    │
│  └───────────────────────────┬─────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────────────────▼─────────────────────────────────┐    │
│  │  Payment Strategy Selection                                  │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│    │
│  │  │ Cash        │ │ Credit Card │ │ Gift Card               ││    │
│  │  │ Handler     │ │ Handler     │ │ Handler                 ││    │
│  │  └─────────────┘ └──────┬──────┘ └─────────────────────────┘│    │
│  └─────────────────────────┼───────────────────────────────────┘    │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                   External Payment Processors                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  Datacap EMV    │  │  TriPOS         │  │  Gift Card API      │  │
│  │  (COM/XML)      │  │  (REST/HMAC)    │  │  (REST/HTTPS)       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Payment Types & Tender Codes

| Tender Type | Code | Handler | Notes |
|-------------|------|---------|-------|
| Cash | 1 | CashPaymentHandler | Calculate change |
| Credit Card | 2 | CreditCardPaymentHandler | Datacap or TriPOS |
| Debit Card | 3 | CreditCardPaymentHandler | Same as credit |
| Gift Card | 4 | GiftCardPaymentHandler | Balance check required |
| House Account | 5 | HouseAccountHandler | Customer charge |
| Meal Plan | 6 | MealPlanPaymentHandler | Point deduction |
| Mobile Payment | 7 | MobilePaymentHandler | Apple/Google Pay |

---

## Key Files Reference

### Infrastructure Layer

| File | Purpose |
|------|---------|
| `SI360.Infrastructure/IService/IPaymentService.cs` | Payment service interface |
| `SI360.Infrastructure/Services/PaymentService.cs` | Payment orchestration |
| `SI360.Infrastructure/IRepository/IPaymentRepository.cs` | Payment data access |
| `SI360.Infrastructure/Repositories/PaymentRepository.cs` | Payment persistence |

### Domain Layer

| File | Purpose |
|------|---------|
| `SI360.Domain/DTO/PaymentRequest.cs` | Payment request model |
| `SI360.Domain/DTO/PaymentResponse.cs` | Payment response model |
| `SI360.Domain/Models/Payment.cs` | Payment entity |
| `SI360.Domain/Models/PaymentMedia.cs` | Tender type entity |

### UI Layer

| File | Purpose |
|------|---------|
| `SI360.UI/Views/PayCheckView.xaml` | Payment screen |
| `SI360.UI/ViewModels/PayCheckViewModel.cs` | Payment logic |
| `SI360.UI/Views/ChargeTipDialog.xaml` | Tip entry dialog |

---

## Payment Service Interface

```csharp
public interface IPaymentService
{
    // Core Payment Operations
    Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request);
    Task<PaymentResponse> ProcessCashPaymentAsync(PaymentRequest request);
    Task<PaymentResponse> ProcessCreditCardPaymentAsync(PaymentRequest request);
    Task<PaymentResponse> ProcessGiftCardPaymentAsync(PaymentRequest request);

    // Tip Operations
    Task<TipResponse> AddTipAsync(Guid saleId, decimal tipAmount, string transactionId);
    Task<TipSuggestions> CalculateTipSuggestionsAsync(decimal subtotal);

    // Void & Refund
    Task<PaymentResponse> VoidTransactionAsync(string transactionId, int employeeId);
    Task<PaymentResponse> RefundTransactionAsync(string transactionId, decimal amount, int employeeId);

    // Split Payment
    Task<PaymentResponse> ProcessSplitPaymentAsync(Guid saleId, List<PaymentRequest> payments);

    // Settlement
    Task<SettlementResponse> ProcessSettlementAsync(int employeeId);

    // Validation
    Task<bool> ValidatePaymentAmountAsync(Guid saleId, decimal amount);
    Task<GiftCardBalanceResponse> CheckGiftCardBalanceAsync(string cardNumber);
}
```

---

## Payment Request/Response DTOs

### PaymentRequest

```csharp
public class PaymentRequest
{
    public Guid SaleId { get; set; }
    public Guid PaymentId { get; set; } = Guid.NewGuid();
    public int TenderType { get; set; }
    public decimal Amount { get; set; }
    public decimal TipAmount { get; set; }
    public decimal TotalAmount => Amount + TipAmount;

    // Card Payment Fields
    public string? CardNumber { get; set; }
    public string? CardHolderName { get; set; }
    public string? ExpirationDate { get; set; }
    public string? CVV { get; set; }

    // Gift Card Fields
    public string? GiftCardNumber { get; set; }
    public string? GiftCardPin { get; set; }

    // Metadata
    public int EmployeeId { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
```

### PaymentResponse

```csharp
public class PaymentResponse
{
    public bool IsSuccess { get; set; }
    public string? TransactionId { get; set; }
    public string? AuthorizationCode { get; set; }
    public decimal AmountCharged { get; set; }
    public decimal ChangeAmount { get; set; }
    public decimal RemainingBalance { get; set; }

    // Error Information
    public int ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }

    // Receipt Data
    public string? ReceiptText { get; set; }
    public string? CardType { get; set; }
    public string? LastFourDigits { get; set; }

    // Status
    public PaymentStatus Status { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}

public enum PaymentStatus
{
    Pending = 0,
    Approved = 1,
    Declined = 2,
    Voided = 3,
    Refunded = 4,
    Error = 5
}
```

---

## Payment Service Implementation

```csharp
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IGiftCardRepository _giftCardRepository;
    private readonly AsyncRetryPolicy _retryPolicy;
    private readonly IErrorHandler _errorHandler;
    private readonly IDbChangeNotifier _signalRNotifier;
    private readonly IDbConnectionFactory _connectionFactory;

    public PaymentService(
        IPaymentRepository paymentRepository,
        ISaleRepository saleRepository,
        IGiftCardRepository giftCardRepository,
        AsyncRetryPolicy retryPolicy,
        IErrorHandler errorHandler,
        IDbChangeNotifier signalRNotifier,
        IDbConnectionFactory connectionFactory)
    {
        _paymentRepository = paymentRepository;
        _saleRepository = saleRepository;
        _giftCardRepository = giftCardRepository;
        _retryPolicy = retryPolicy;
        _errorHandler = errorHandler;
        _signalRNotifier = signalRNotifier;
        _connectionFactory = connectionFactory;
    }

    public async Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request)
    {
        try
        {
            // Validate payment amount
            if (!await ValidatePaymentAmountAsync(request.SaleId, request.TotalAmount))
            {
                return new PaymentResponse
                {
                    IsSuccess = false,
                    ErrorCode = 1001,
                    ErrorMessage = "Invalid payment amount",
                    Status = PaymentStatus.Error
                };
            }

            // Route to appropriate handler based on tender type
            var response = request.TenderType switch
            {
                1 => await ProcessCashPaymentAsync(request),
                2 or 3 => await ProcessCreditCardPaymentAsync(request),
                4 => await ProcessGiftCardPaymentAsync(request),
                5 => await ProcessHouseAccountPaymentAsync(request),
                6 => await ProcessMealPlanPaymentAsync(request),
                _ => new PaymentResponse
                {
                    IsSuccess = false,
                    ErrorCode = 1002,
                    ErrorMessage = $"Unsupported tender type: {request.TenderType}",
                    Status = PaymentStatus.Error
                }
            };

            if (response.IsSuccess)
            {
                // Notify other terminals via SignalR
                await _signalRNotifier.NotifyAsync(new DbChangeEvent
                {
                    Table = "Payment",
                    Action = "INSERT",
                    SaleId = request.SaleId,
                    Timestamp = DateTime.UtcNow
                });

                await _errorHandler.LogInfoAsync(
                    $"Payment processed: SaleId={request.SaleId}, Amount={request.TotalAmount:C}, Type={request.TenderType}",
                    nameof(PaymentService));
            }

            return response;
        }
        catch (Exception ex)
        {
            await _errorHandler.LogErrorAsync(ex,
                $"Payment processing failed: SaleId={request.SaleId}",
                "System");

            return new PaymentResponse
            {
                IsSuccess = false,
                ErrorCode = 9999,
                ErrorMessage = "Payment processing failed. Please try again.",
                Status = PaymentStatus.Error
            };
        }
    }

    public async Task<PaymentResponse> ProcessCashPaymentAsync(PaymentRequest request)
    {
        return await _retryPolicy.ExecuteAsync(async () =>
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            using var transaction = connection.BeginTransaction();

            try
            {
                // Get sale to calculate change
                var sale = await _saleRepository.GetByIdAsync(request.SaleId);
                if (sale == null)
                {
                    return new PaymentResponse
                    {
                        IsSuccess = false,
                        ErrorCode = 1003,
                        ErrorMessage = "Sale not found",
                        Status = PaymentStatus.Error
                    };
                }

                var changeAmount = request.Amount - sale.BalanceDue;
                if (changeAmount < 0) changeAmount = 0;

                // Record payment
                var payment = new Payment
                {
                    PaymentId = request.PaymentId,
                    SaleId = request.SaleId,
                    TenderType = request.TenderType,
                    Amount = request.Amount,
                    TipAmount = request.TipAmount,
                    ChangeAmount = changeAmount,
                    EmployeeId = request.EmployeeId,
                    Timestamp = DateTime.UtcNow
                };

                await _paymentRepository.InsertAsync(connection, transaction, payment);

                // Update sale balance
                sale.BalanceDue -= (request.Amount - changeAmount);
                if (sale.BalanceDue <= 0)
                {
                    sale.BalanceDue = 0;
                    sale.IsPaid = true;
                    sale.CheckStatus = 2; // Closed
                }

                await _saleRepository.UpdateAsync(connection, transaction, sale);

                transaction.Commit();

                return new PaymentResponse
                {
                    IsSuccess = true,
                    TransactionId = request.PaymentId.ToString(),
                    AmountCharged = request.Amount - changeAmount,
                    ChangeAmount = changeAmount,
                    Status = PaymentStatus.Approved,
                    ProcessedAt = DateTime.UtcNow
                };
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        });
    }

    public async Task<TipSuggestions> CalculateTipSuggestionsAsync(decimal subtotal)
    {
        return await Task.FromResult(new TipSuggestions
        {
            Tip15Percent = Math.Round(subtotal * 0.15m, 2),
            Tip18Percent = Math.Round(subtotal * 0.18m, 2),
            Tip20Percent = Math.Round(subtotal * 0.20m, 2),
            Tip22Percent = Math.Round(subtotal * 0.22m, 2)
        });
    }

    public async Task<PaymentResponse> VoidTransactionAsync(string transactionId, int employeeId)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                var payment = await _paymentRepository.GetByTransactionIdAsync(transactionId);
                if (payment == null)
                {
                    return new PaymentResponse
                    {
                        IsSuccess = false,
                        ErrorCode = 1004,
                        ErrorMessage = "Transaction not found",
                        Status = PaymentStatus.Error
                    };
                }

                // Check if within void window (typically 25 minutes for card transactions)
                var minutesSincePayment = (DateTime.UtcNow - payment.Timestamp).TotalMinutes;
                if (payment.TenderType == 2 && minutesSincePayment > 25)
                {
                    return new PaymentResponse
                    {
                        IsSuccess = false,
                        ErrorCode = 1005,
                        ErrorMessage = "Void window expired. Please process a refund instead.",
                        Status = PaymentStatus.Error
                    };
                }

                // Mark as voided
                payment.IsVoided = true;
                payment.VoidedBy = employeeId;
                payment.VoidedAt = DateTime.UtcNow;

                await _paymentRepository.UpdateAsync(payment);

                // Restore sale balance
                var sale = await _saleRepository.GetByIdAsync(payment.SaleId);
                if (sale != null)
                {
                    sale.BalanceDue += payment.Amount;
                    sale.IsPaid = false;
                    sale.CheckStatus = 1; // Reopen
                    await _saleRepository.UpdateAsync(sale);
                }

                await _errorHandler.LogInfoAsync(
                    $"Payment voided: TransactionId={transactionId}, Amount={payment.Amount:C}",
                    nameof(PaymentService));

                return new PaymentResponse
                {
                    IsSuccess = true,
                    TransactionId = transactionId,
                    Status = PaymentStatus.Voided
                };
            });
        }
        catch (Exception ex)
        {
            await _errorHandler.LogErrorAsync(ex,
                $"Void failed: TransactionId={transactionId}",
                "System");
            throw;
        }
    }

    public async Task<bool> ValidatePaymentAmountAsync(Guid saleId, decimal amount)
    {
        if (amount <= 0) return false;

        var sale = await _saleRepository.GetByIdAsync(saleId);
        if (sale == null) return false;

        // Allow overpayment for cash (change will be given)
        return amount <= sale.BalanceDue * 1.5m; // Max 150% for tips
    }
}
```

---

## Datacap EMV Integration

### Configuration (appsettings.json)

```json
{
  "Datacap": {
    "MID": "MERCHANT_ID",
    "HostOrIp": "192.168.1.100",
    "IpPort": "9100",
    "ComPort": "COM1",
    "SecureDevice": "EMV_DEVICE",
    "PinPadIpAddress": "192.168.1.101",
    "PosVersion": "2026.1.0"
  }
}
```

### Datacap Operations

| Operation | Method | Description |
|-----------|--------|-------------|
| EMVParamDownload | `DownloadParametersAsync()` | Download EMV parameters to device |
| EMVPadReset | `ResetPinPadAsync()` | Reset PIN pad |
| EMVSale | `ProcessSaleAsync()` | Process sale transaction |
| EMVReturn | `ProcessRefundAsync()` | Process refund |
| Adjustment | `AddTipAsync()` | Add tip/gratuity |
| VoidSaleByRecordNo | `VoidTransactionAsync()` | Void within 25 minutes |
| BatchClose | `CloseBatchAsync()` | End-of-day settlement |

### Datacap Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 00 | Approved | Transaction successful |
| 05 | Declined | Ask for alternative payment |
| 12 | Invalid Transaction | Check card/amount |
| 14 | Invalid Card | Card not readable |
| 51 | Insufficient Funds | Ask for partial or different payment |
| 54 | Expired Card | Request different card |
| 91 | Issuer Unavailable | Retry or offline mode |

---

## TriPOS Integration

### Configuration (appsettings.json)

```json
{
  "Tripos": {
    "BaseUrl": "http://localhost:8080/",
    "ApplicationId": "APP_ID",
    "AcceptorId": "ACCEPTOR_ID",
    "AccountId": "ACCOUNT_ID",
    "AccountToken": "SECRET_TOKEN",
    "LaneId": "1"
  }
}
```

### TriPOS Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Sale | POST | `/api/v1/sale` |
| Authorization | POST | `/api/v1/authorization` |
| Refund | POST | `/api/v1/refund/{transactionId}` |
| Void | POST | `/api/v1/void/{transactionId}` |
| Capture | POST | `/api/v1/capture/{transactionId}` |

### TriPOS HMAC Authentication

```csharp
public class TriPosAuthHelper
{
    public static string GenerateHmacSignature(
        string accountToken,
        string applicationId,
        string httpMethod,
        string requestUri,
        string contentType,
        string contentMd5,
        string timestamp)
    {
        var signatureData = $"{httpMethod}\n{contentType}\n{contentMd5}\n{timestamp}\n{requestUri}";

        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(accountToken));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(signatureData));
        return Convert.ToBase64String(hash);
    }
}
```

---

## Gift Card Processing

### Gift Card Operations

| Operation | Description |
|-----------|-------------|
| Balance Check | Query available balance before payment |
| Redemption | Deduct amount from card balance |
| Reload | Add funds to existing card |
| Activation | Activate new gift card |

### Gift Card Service

```csharp
public interface IGiftCardService
{
    Task<GiftCardBalanceResponse> CheckBalanceAsync(string cardNumber);
    Task<PaymentResponse> RedeemAsync(string cardNumber, decimal amount, Guid saleId);
    Task<GiftCardResponse> ReloadAsync(string cardNumber, decimal amount);
    Task<GiftCardResponse> ActivateAsync(string cardNumber, decimal initialBalance);
}
```

---

## Error Handling Patterns

### Payment-Specific Retry Logic

```csharp
// Payment operations should NOT retry on certain errors
private static readonly int[] NonRetryableErrors = new[]
{
    1001, // Invalid amount
    1002, // Unsupported tender
    1003, // Sale not found
    1004, // Transaction not found
    1005, // Void window expired
    51,   // Insufficient funds
    54,   // Expired card
    14    // Invalid card
};

public bool ShouldRetry(int errorCode)
{
    return !NonRetryableErrors.Contains(errorCode);
}
```

### Logging Payment Transactions

```csharp
// Always log payment attempts (success and failure)
await _errorHandler.LogInfoAsync(
    $"PAYMENT_ATTEMPT: Sale={saleId}, Type={tenderType}, Amount={amount:C}",
    nameof(PaymentService));

// Log failures with detail
await _errorHandler.LogWarningAsync(
    $"PAYMENT_DECLINED: Sale={saleId}, Code={errorCode}, Message={errorMessage}",
    nameof(PaymentService),
    employeeId.ToString());

// Log successful payments
await _errorHandler.LogInfoAsync(
    $"PAYMENT_SUCCESS: Sale={saleId}, TransactionId={transactionId}, Amount={amount:C}",
    nameof(PaymentService));
```

---

## Security Considerations

### PCI-DSS Compliance

| Requirement | Implementation |
|-------------|----------------|
| Never store CVV | Do not persist CVV after authorization |
| Encrypt card data | Use TLS for all card transmissions |
| Mask card numbers | Only store last 4 digits |
| Secure logging | Never log full card numbers |
| Access control | Require manager PIN for voids/refunds |

### Sensitive Data Handling

```csharp
// NEVER log full card numbers
public string MaskCardNumber(string cardNumber)
{
    if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 4)
        return "****";

    return $"****-****-****-{cardNumber[^4..]}";
}

// NEVER persist CVV
public class PaymentRequest
{
    // CVV is transient - never saved to database
    [JsonIgnore]
    public string? CVV { get; set; }
}
```

---

## Common Issues & Solutions

### Issue 1: Payment Timeout
**Symptom:** Transaction hangs, no response from processor
**Solution:**
```csharp
// Configure appropriate timeouts
var httpClient = new HttpClient
{
    Timeout = TimeSpan.FromSeconds(30) // 30 seconds for payment
};

// Implement cancellation token
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
var response = await ProcessWithTimeoutAsync(request, cts.Token);
```

### Issue 2: Duplicate Transactions
**Symptom:** Customer charged twice
**Solution:**
```csharp
// Use idempotency keys
public async Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request)
{
    // Check for existing transaction with same idempotency key
    var existing = await _paymentRepository.GetByIdempotencyKeyAsync(request.IdempotencyKey);
    if (existing != null)
    {
        return existing.ToResponse(); // Return cached result
    }

    // Process new transaction
    // ...
}
```

### Issue 3: Offline Payment Handling
**Symptom:** Network unavailable during payment
**Solution:**
```csharp
// Store-and-forward for offline scenarios
if (!await IsOnlineAsync())
{
    return await StoreForLaterProcessingAsync(request);
}
```

---

## Checklist for New Payment Features

### Adding New Tender Type
- [ ] Add tender code to enum/constants
- [ ] Create handler method in PaymentService
- [ ] Add case to ProcessPaymentAsync switch
- [ ] Create/update DTOs if needed
- [ ] Add UI button in PayCheckView
- [ ] Register in DI container
- [ ] Add unit tests
- [ ] Update documentation

### Adding New Payment Processor
- [ ] Create processor-specific manager class
- [ ] Implement IPaymentProcessor interface
- [ ] Add configuration section to appsettings.json
- [ ] Implement authentication (HMAC, OAuth, etc.)
- [ ] Add error code mappings
- [ ] Implement retry logic with appropriate exclusions
- [ ] Add logging for all operations
- [ ] Create integration tests
- [ ] Document API endpoints and error codes

---

## Related Workflows

| Workflow ID | Name | Description |
|-------------|------|-------------|
| WF-PAY-001 | Navigate to Payment | Open payment screen |
| WF-PAY-002 | Select Tender | Choose payment method |
| WF-PAY-003 | Cash Payment | Process cash with change |
| WF-PAY-004 | Credit Card Payment | Process via Datacap/TriPOS |
| WF-PAY-005 | Gift Card Payment | Balance check and redemption |
| WF-PAY-007 | Split Payment | Multiple tenders |
| WF-PAY-009 | Print Receipt | Generate payment receipt |
| WF-PAY-010 | Settlement | End-of-day batch close |

---

*Always address the user as **Francis**.*
