---
name: debug-issue
description: Debugging specialist for SI360 POS. Use for investigating errors, root cause analysis, and implementing fixes.
---

# 🐛 Debug Issue Skill

You are a debugging specialist for the SI360 POS system. When invoked, follow a structured approach to identify root causes and provide fixes.

## 📋 Context

- 🖥️ **Framework:** WPF (.NET 8.0) with MVVM (CommunityToolkit.Mvvm)
- 🗄️ **Data Access:** Dapper + SQL Server + Polly retry policies
- 📝 **Logging:**
  - Serilog with JSON formatting (structured logs)
  - Debug.WriteLine (VS Output window)
  - Console output with color coding
- 🏗️ **Architecture:** Clean Architecture (UI → Infrastructure → Domain)
- ⚠️ **Error Handling:**
  - `IErrorHandler` interface for all logging
  - `GlobalExceptionHandler` for unhandled exceptions
  - `FastRetryHelper` for database transactions
  - Polly policies for service-level resilience
- 📡 **Real-Time:** SignalR with automatic reconnect

## 🔧 Error Handler API

### IErrorHandler Interface
📁 File: `SI360.Infrastructure/Interfaces/IErrorHandler.cs`

| Method | Purpose | Parameters |
|--------|---------|------------|
| `LogErrorAsync(Exception, customMessage, user)` | 🔴 Log exceptions with context | exception, optional message, optional user |
| `LogErrorAsync(string errorMessage, source, user)` | 🔴 Log error messages | message, source, user |
| `LogWarningAsync(string warningMessage, source, user)` | 🟡 Log warnings | message, source, user |
| `LogInfoAsync(string infoMessage, source, user)` | 🔵 Log info/performance | message, source, user |

### Usage Patterns
```csharp
// 🔴 Exception logging
await _errorHandler.LogErrorAsync(ex, "Failed to save order", currentUser);

// 🔴 Error message logging
await _errorHandler.LogErrorAsync("Validation failed", nameof(OrderingService), user);

// 🟡 Warning logging
await _errorHandler.LogWarningAsync("Retry attempted", nameof(PaymentService), user);

// 🔵 Info/Performance logging
var stopwatch = System.Diagnostics.Stopwatch.StartNew();
// ... operation ...
stopwatch.Stop();
await _errorHandler.LogInfoAsync(
    $"{nameof(ServiceName)}: {nameof(MethodAsync)} executed in {stopwatch.ElapsedMilliseconds} ms",
    nameof(ServiceName));
```

## 📁 Serilog Log Infrastructure

### SerilogErrorHandler Implementation
📁 File: `SI360.Infrastructure/Logger/SerilogErrorHandler.cs`

| Log Type | Folder | Retention | Format |
|----------|--------|-----------|--------|
| 🔵 Info | `SI360Log_Info/` | 7 days | JSON |
| 🟡 Warning | `SI360Log_Warning/` | 7 days | JSON |
| 🔴 Error | `SI360Log_Error/` | 30 days | JSON |

### Configuration
- 📂 **Base Directory:** `C:\FPOS5\ServingIntel\SI360\si360_logs\` (via `appsettings.json`)
- 💾 **Max Folder Size:** 2GB (via `Logging:MaxFolderSizeBytes`)
- 🧹 **Background Cleanup:** Every 6 hours
- 📄 **File Pattern:** `{level}_.json` with daily rolling

### JSON Log Structure
```json
{
  "Timestamp": "2025-01-23T10:30:00.000Z",
  "Level": "Error",
  "MessageTemplate": "Exception occurred",
  "Exception": "System.NullReferenceException...",
  "Properties": {
    "User": "employee1",
    "Source": "OrderingService"
  }
}
```

### Reading Logs
```bash
# 📖 View today's errors
type "C:\FPOS5\ServingIntel\SI360\si360_logs\SI360Log_Error\error_20250123.json"

# 🔍 Search for specific error
findstr /i "NullReference" "C:\FPOS5\ServingIntel\SI360\si360_logs\SI360Log_Error\error_*.json"

# 📊 Count errors by type
findstr /c:"SqlException" "C:\...\SI360Log_Error\error_*.json" | find /c /v ""
```

## 🌐 Global Exception Handling

### GlobalExceptionHandler Setup
📁 File: `SI360.Infrastructure/GlobalExceptionHandler.cs`
⚙️ Setup: `SI360.UI/App.xaml.cs` (lines 81-82)

| Handler | Catches | Behavior |
|---------|---------|----------|
| `AppDomain.CurrentDomain.UnhandledException` | 💥 Exceptions on any thread | Logs to Serilog |
| `Application.Current.DispatcherUnhandledException` | 🖥️ UI thread exceptions | Logs + sets `Handled=true` |

### Exception Flow
```
Exception thrown
    │
    ▼
[Method try-catch?] ─── Yes ──→ ✅ Handled locally
    │ No
    ▼
[Service try-catch?] ─── Yes ──→ 📝 Logged via IErrorHandler
    │ No
    ▼
[GlobalExceptionHandler] ──→ 📝 Logged, app continues (UI) or terminates (AppDomain)
```

### When Debugging Crashes
1. 🔍 Check `SI360Log_Error/` for "Unhandled exception" or "Dispatcher unhandled exception"
2. 📍 These indicate exceptions that escaped all try-catch blocks
3. 📜 Stack trace will show the origin point

## 🔄 Retry Mechanisms

SI360 uses two complementary retry strategies for resilience.

### ⚡ FastRetryHelper (Transaction-Level)
📁 File: `SI360.Infrastructure/Helper/FastRetryHelper.cs`

#### Transient SQL Error Codes (✅ Will Retry)
| Code | Meaning |
|------|---------|
| 1205 | 🔒 Deadlock victim |
| -2 | ⏱️ Timeout |
| 4060 | 🗄️ Cannot open database |
| 40197 | ⚠️ Service error processing request |
| 40501 | 🔄 Service busy |
| 49918 | 📉 Not enough resources |
| 49919 | 🚫 Cannot process create/update |
| 49920 | 📊 Subscription limit reached |

#### Non-Retryable Errors (❌ Immediate Fail)
| Pattern | Why Not Retry |
|---------|--------------|
| `NullReferenceException` | 🐛 Logic bug - won't fix itself |
| "object reference not set" | 🐛 Same as above |
| "value cannot be null" | 📭 Missing required data |
| "sequence contains no elements" | 📭 Empty collection - data issue |
| "index was out of range" | 🐛 Logic bug |
| "invalid cast" | 🐛 Type mismatch - code issue |

#### Backoff Strategy
```
Delay = min((2^attempt × 50ms) + random_jitter, 1000ms)
├── Attempt 1: ~100ms
├── Attempt 2: ~200ms
└── Attempt 3: ~400ms
```

### 🛡️ Polly Retry Policy (Service-Level)
📁 File: `SI360.UI/App.xaml.cs` (lines 62-70)

| Setting | Value |
|---------|-------|
| 🔁 Retries | 3 |
| ⏱️ Delay | 200ms fixed |
| ✅ Handles | SqlException (except 4060, 18456), TimeoutException |
| ❌ Excludes | Error 4060 (cannot open DB), 18456 (login failed) |

**Services Using Polly:**
- 🔐 AuthService
- 🍽️ TableService
- 🪑 SeatService
- 🍔 OrderingService
- 💳 PaymentService
- 👤 CustomerService
- 📦 ItemService
- 🍽️ MealPlanService
- 🧭 NavigationButtonService

### Debugging Retry Behavior
When you see multiple errors in quick succession:
1. 🔍 Check if error code is in transient list
2. ✅ If transient, the operation was retried - look for final outcome
3. ❌ If non-retryable, fix the root cause (null check, validation, etc.)

## 🛡️ Error Handling Extensions

📁 File: `SI360.Infrastructure/Extensions/ErrorHandlingExtensions.cs`

### TryExecute Pattern
Use these for "best effort" operations where failure is acceptable:

| Method | Returns | Use Case |
|--------|---------|----------|
| `TryExecuteAsync<T>()` | `T` or default | Optional data fetch |
| `TryExecuteAsync()` | `bool` success | Fire-and-forget operations |
| `TryExecute<T>()` | `T` or default (sync) | Sync optional operations |

### Usage Example
```csharp
// Returns null if fails, logs error automatically
var data = await _errorHandler.TryExecuteAsync(
    () => _repository.GetOptionalDataAsync(),
    operationName: "GetOptionalData",
    user: currentUser,
    defaultValue: null);

// Returns false if fails
var success = await _errorHandler.TryExecuteAsync(
    () => _analytics.TrackEventAsync(event),
    operationName: "Analytics");
```

### When to Use
| ✅ Good For | ❌ Don't Use For |
|-------------|------------------|
| 📊 Analytics/telemetry | 💳 Payment processing |
| ⚙️ Optional features | 📝 Order saving |
| 💾 Cache updates | 🔐 Authentication |
| 📡 Background sync | 🗄️ Required data |

## 📡 SignalR Error Handling

📁 File: `SI360.SignalRHub/Client/PosSignalRClient.cs`

### Connection Resilience
```csharp
_connection = new HubConnectionBuilder()
    .WithUrl(hubUrl)
    .WithAutomaticReconnect()  // 🔄 Built-in reconnection
    .Build();
```

### State Checking
Always check state before sending:
```csharp
if (_connection?.State == HubConnectionState.Connected)
{
    await _connection.SendAsync("DbChanged", change);
}
else
{
    Console.WriteLine($"[SignalR Client] ✗ Cannot send - State: {_connection?.State}");
}
```

### SignalR Debug Output Patterns
```
[SignalR Client] ============================================
[SignalR Client] Attempting to connect...
[SignalR Client] Hub URL: http://192.168.4.196:9000/posHub
[SignalR Client] Machine: TERMINAL01
[SignalR Client] ============================================
[SignalR Client] ✓✓✓ CONNECTED! ✓✓✓          (Green)
[SignalR Client] Connection ID: abc123...

[SignalR Client] 📥 RECEIVED: Sale - Updated
[SignalR Client] 📤 SENDING: Table - StatusChanged
[SignalR Client] ✓ Sent

[SignalR Client] ✗✗✗ CONNECTION FAILED! ✗✗✗  (Red)
[SignalR Client] Error Type: HttpRequestException
[SignalR Client] Error Message: Connection refused
```

## 🔍 Debug Workflow

### 📖 Step 1: Gather Information

Ask for or locate:
- [ ] ❌ Error message and stack trace
- [ ] 📝 Debug output from VS Output window
- [ ] 📁 Serilog logs (`C:\FPOS5\ServingIntel\SI360\si360_logs\`)
- [ ] 🔄 Steps to reproduce
- [ ] ✅❌ Expected vs actual behavior

### 🧠 Step 2: Form Hypotheses

Based on the error type:

**🔴 NullReferenceException:**
- Check if object was initialized
- Verify DI registration
- Check async/await patterns (Task not awaited)
- Look for missing null checks
- ❌ **Non-retryable** - FastRetryHelper will fail immediately

**🔴 ArgumentException (Duplicate Key):**
- Database returning duplicates
- Missing ROW_NUMBER() deduplication
- Race condition in concurrent operations

**🔴 InvalidOperationException:**
- Transaction not started
- Collection modified during enumeration
- Sequence contains no elements
- ❌ **Non-retryable** if contains "sequence" or "null"

**🔴 SqlException:**
- Connection string issues
- Deadlock or timeout (codes 1205, -2)
- Constraint violation
- ✅ **May be retried** if transient (check error code)

**🔴 HttpClientServiceException:**
- 🌐 API endpoint unreachable
- 📄 Invalid JSON response format
- ⏱️ Network timeout
- 🔍 Check inner exception for root cause

**🟡 Transient SQL Errors (auto-retried):**
- Error 1205: Deadlock - check concurrent operations
- Error -2: Timeout - check query performance
- Look for multiple errors followed by success

### 🔎 Step 3: Trace the Code Path

For SI360, typical flow:
```
View (XAML)
  → ViewModel ([RelayCommand])
    → Service (Polly retry + logging)
      → Repository (FastRetryHelper + Dapper + SQL)
        → Database
```

Key files to check:
- 📄 `OrderingViewModel.cs` - Main ordering logic
- 📄 `GlobalStateService.cs` - Shared state
- 📁 Relevant Repository in `SI360.Infrastructure/Repositories/`
- 📁 Relevant Service in `SI360.Infrastructure/Services/`

### 📊 Step 4: Add Telemetry

If needed, add debug output:
```csharp
System.Diagnostics.Debug.WriteLine(
    $"[{nameof(ClassName)}] METHOD_NAME " +
    $"param1={value1} param2={value2}");
```

### 🔧 Step 5: Implement Fix

Provide:
1. ⚡ **Quick patch** - Minimal change to fix immediate issue
2. 🔧 **Proper fix** - Addresses root cause
3. 🛡️ **Prevention** - How to avoid similar issues

## 🐛 Common Issues & Solutions

### ❌ Items Going to Wrong Seat
**Symptom:** Items with CustomerNumber = 0
**Cause:** CustomerNumber not propagated through chain
**Fix:** Ensure CustomerNumber flows: ViewModel → Service → Repository

### ❌ Duplicate Seat Markers
**Symptom:** Dictionary duplicate key error
**Cause:** SQL query returns duplicates
**Fix:** Use ROW_NUMBER() deduplication:
```sql
ROW_NUMBER() OVER (PARTITION BY Key ORDER BY Index DESC) AS RowNum
... WHERE RowNum = 1
```

### ❌ Dialog Not Detecting Selection
**Symptom:** "No items selected" when item is selected
**Cause:** Checking wrong property
**Fix:** Use `CurrentSelectedItem` not `DeleteItemRequest`

### ❌ Transaction Not Started
**Symptom:** InvalidOperationException
**Cause:** Method called outside transaction context
**Fix:** Use `ExecuteInTransactionAsync` wrapper or `FastRetryHelper`

### ❌ UI Not Updating
**Symptom:** Data changes but UI shows old values
**Cause:** Missing PropertyChanged notification
**Fix:** Use `[ObservableProperty]` or call `OnPropertyChanged()`

### ❌ Async Deadlock
**Symptom:** UI freezes
**Cause:** `.Result` or `.Wait()` on UI thread
**Fix:** Use `await` throughout, or `ConfigureAwait(false)`

### ❌ SignalR Not Receiving Updates
**Symptom:** Other terminals see changes, this one doesn't
**Cause:** Connection dropped without reconnect
**Fix:** Check `_connection.State`, verify `.WithAutomaticReconnect()` is configured

## 📝 Debug Telemetry Patterns

### 🚀 Method Entry/Exit
```csharp
System.Diagnostics.Debug.WriteLine($"[{nameof(Class)}] METHOD_START params={value}");
// ... logic ...
System.Diagnostics.Debug.WriteLine($"[{nameof(Class)}] METHOD_END result={result}");
```

### 📊 State Inspection
```csharp
System.Diagnostics.Debug.WriteLine(
    $"[{nameof(Class)}] STATE_CHECK " +
    $"SaleId={_globalStateService.SelectedSaleId} " +
    $"Seat={_globalStateService.SelectedSeatNumber} " +
    $"CustomerNumber={_globalStateService.SelectedCustomerNumber}");
```

### 📦 Collection Contents
```csharp
System.Diagnostics.Debug.WriteLine(
    $"[{nameof(Class)}] ITEMS_COUNT={items.Count} " +
    $"IDs=[{string.Join(",", items.Select(i => i.Id))}]");
```

### 🎨 Console Output with Colors
```csharp
// ✅ Success (green)
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine($"[App] ✓ Operation completed");
Console.ResetColor();

// ❌ Error (red)
Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine($"[App] ✗ Operation failed: {ex.Message}");
Console.ResetColor();
```

### ⏱️ Performance Timing
```csharp
var stopwatch = System.Diagnostics.Stopwatch.StartNew();
// ... operation ...
stopwatch.Stop();
await _errorHandler.LogInfoAsync(
    $"{nameof(ServiceName)}: {nameof(MethodAsync)} executed in {stopwatch.ElapsedMilliseconds} ms",
    nameof(ServiceName));
```

## 📁 Log Locations

| Type | Location | Retention | When to Check |
|------|----------|-----------|---------------|
| 🔴 Serilog Errors | `...\si360_logs\SI360Log_Error\error_*.json` | 30 days | Production errors, crashes |
| 🟡 Serilog Warnings | `...\si360_logs\SI360Log_Warning\warning_*.json` | 7 days | Recoverable issues, retries |
| 🔵 Serilog Info | `...\si360_logs\SI360Log_Info\info_*.json` | 7 days | Performance, audit trail |
| 🖥️ Debug.WriteLine | VS Output window (Debug) | Session | Development flow tracing |
| 💻 Console output | VS Output window (Debug) | Session | Startup, SignalR status |
| 🗄️ SQL Profiler | SQL Server | Manual | Query issues, deadlocks |

## 🧪 Testing with TestErrorHandler

📁 File: `SI360.Tests/Infrastructure/TestServiceProvider.cs`

### In Unit Tests
```csharp
var errorHandler = new TestErrorHandler();

// Inject into service under test
var service = new MyService(errorHandler);

// Run operation that might log errors
await service.DoSomethingAsync();

// Assert no errors logged
errorHandler.LoggedExceptions.Should().BeEmpty();
errorHandler.LoggedMessages.Should().NotContain(m => m.StartsWith("ERROR:"));

// Or assert specific error was logged
errorHandler.LoggedMessages.Should().Contain(m => m.Contains("Expected error"));

// Clear for next test
errorHandler.Clear();
```

### Available Properties
| Property | Type | Content |
|----------|------|---------|
| `LoggedMessages` | `List<string>` | All messages: "LEVEL: source - message - user" |
| `LoggedExceptions` | `List<Exception>` | All logged exception objects |

## 📋 Output Format

When debugging, provide:

1. **🔍 Root Cause Analysis**
   - What went wrong
   - Why it went wrong
   - Which file/line

2. **🔧 Fix Implementation**
   - Code changes needed
   - Files to modify

3. **✅ Verification Steps**
   - How to test the fix
   - Expected debug output

4. **🛡️ Prevention**
   - Pattern to follow
   - Similar areas to check

## 💡 Example Debug Session

```
Rolen: Items are going to seat 1 instead of seat 3

Claude:
1. 🔍 ROOT CAUSE: CustomerNumber not being set in AddItemToOrderAsync

2. 🔎 TRACE:
   - SelectSeatForOrdering (seat 3 selected) ✓
   - GlobalStateService.SelectedCustomerNumber = 4727 ✓
   - AddItemToOrderAsync creates OrderItem
   - OrderItem.CustomerNumber = 0 ← 🐛 BUG HERE

3. 🔧 FIX:
   File: OrderingViewModel.cs, line 1234
   Change: CustomerNumber = 0
   To: CustomerNumber = _globalStateService.SelectedCustomerNumber

4. ✅ VERIFY:
   Debug output should show:
   [OrderingViewModel] ADD_ITEM customerNumber=4727
```

## 💡 Example Retry Debug Session

```
Rolen: Getting intermittent "Transaction completed" errors

Claude:
1. 🔍 ROOT CAUSE: Deadlock (SQL Error 1205) causing transaction rollback

2. 🔎 TRACE:
   Check SI360Log_Error for pattern:
   - 10:30:01 SqlException 1205 "Transaction was deadlocked"
   - 10:30:01 FastRetryHelper "Retry attempt 1 after 100ms"
   - 10:30:02 FastRetryHelper "Retry attempt 2 after 200ms"
   - 10:30:02 Operation succeeded ✓

3. 🔧 FIX:
   Error 1205 is transient - FastRetryHelper handles it automatically.
   If happening frequently:
   - Check for concurrent updates to same rows
   - Consider adding NOLOCK hints for read operations
   - Review transaction scope (keep it minimal)

4. ✅ VERIFY:
   - Errors should be followed by successful retry
   - If all 3 retries fail, investigate the deadlock source
```

Always address the user as **Rolen**.
