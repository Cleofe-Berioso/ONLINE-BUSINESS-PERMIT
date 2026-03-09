---
name: qa-testing
description: QA and testing specialist for SI360 POS. Use for test scenarios, verification steps, and manual testing workflows.
---

# 🧪 QA Testing Skill

You are a QA testing specialist for the SI360 POS system. When invoked, help create test scenarios, verification steps, and ensure quality across features.

## 📋 Context

- 🖥️ **Framework:** WPF (.NET 8.0) with MVVM
- 🧪 **Test Project:** SI360.Tests (xUnit-based)
- 🏗️ **Architecture:** Clean Architecture (UI → Infrastructure → Domain)
- 🗄️ **Database:** SQL Server with LocalDB for testing
- ⚙️ **Test Framework:** xUnit v2.9.3 with Moq v4.20.69 and FluentAssertions v6.12.0
- 📡 **Real-Time:** SignalR Hub for database change notifications
- 📝 **Logging:** Serilog with structured logging patterns

## 🛠️ Test Framework & Infrastructure

### 📦 Testing Stack
| Package | Version | Purpose |
|---------|---------|---------|
| 🧪 xUnit | v2.9.3 | Test framework |
| 🎭 Moq | v4.20.69 | Mocking |
| ✅ FluentAssertions | v6.12.0 | Fluent assertions |
| 📊 coverlet.collector | v6.0.0 | Code coverage |

### 📁 Test Project Structure
```
SI360.Tests/
├── 💰 AutoFlow/                 # Auto-Flow Discount tests
├── 🍽️ AutoGratuity/             # Auto-Gratuity calculation tests
├── ⚙️ Configuration/            # Configuration repository tests
├── 💵 DeviceCashoutReport/      # Device cashout report tests
├── 🔧 Infrastructure/           # TestServiceProvider, TestErrorHandler
├── 🔗 Integration/              # End-to-end integration tests
├── 🖼️ Media/                    # Media repository tests
├── 📦 Models/                   # Domain model tests
├── ⚡ Performance/              # Performance benchmark tests
├── 🔌 Services/                 # Service layer tests
├── ⚙️ SystemSettings/           # System settings tests
├── 🔨 Utilities/                # Utility class tests
└── 🖼️ ViewModels/               # ViewModel unit tests
```

### 🔧 TestServiceProvider Setup
```csharp
// Get service from test container
var service = TestServiceProvider.GetService<IPaymentService>();

// Reset between tests if needed
TestServiceProvider.Reset();
```

### ⚠️ TestErrorHandler Usage
```csharp
var errorHandler = new TestErrorHandler();
// ... run test code ...
errorHandler.LoggedMessages.Should().BeEmpty();
errorHandler.LoggedExceptions.Should().BeEmpty();
errorHandler.Clear(); // Reset for next test
```

## ▶️ Running Tests

### 💻 Command Line
```bash
# Run all tests
dotnet test SI360.Tests

# Run specific test category
dotnet test SI360.Tests --filter "FullyQualifiedName~Integration"
dotnet test SI360.Tests --filter "FullyQualifiedName~Performance"
dotnet test SI360.Tests --filter "FullyQualifiedName~ViewModel"

# Run with coverage
dotnet test SI360.Tests --collect:"XPlat Code Coverage"

# Run single test class
dotnet test SI360.Tests --filter "FullyQualifiedName~AutoFlowDiscountServiceTests"
```

### 🪟 Visual Studio
1. Open Test Explorer (Ctrl+E, T)
2. Group by Project → Namespace → Class
3. Right-click to run selected tests

## 🤖 Automated Test Categories

### 🔌 Service Tests
| Test File | Coverage Area | Key Scenarios |
|-----------|---------------|---------------|
| AutoFlowDiscountServiceTests | 💰 Auto-discount calculation | No config returns original, percentage discount, revenue center eligibility |
| AutoGratuityServiceTests | 🍽️ Gratuity calculation | Null rules, null connection handling, tax calculations |
| DeviceCashoutReportServiceTests | 📊 End-of-day reporting | Valid report generation, empty breakdowns, null handling |
| PaymentServiceTests | 💳 Payment processing | Transaction flow, validation, tip calculations |
| RoomServiceTests | 🏠 Room management | Room CRUD operations |

### 🗄️ Repository Tests
| Test File | Coverage Area |
|-----------|---------------|
| AutoGratuityRepositoryTests | 🍽️ Gratuity data access |
| ConfigurationRepositoryTests | ⚙️ Configuration retrieval |
| MediaRepositoryTests | 🖼️ Media asset management |
| SystemSettingsRepositoryTests | ⚙️ System settings persistence |

### 🖼️ ViewModel Tests
| Test File | Coverage Area | Key Scenarios |
|-----------|---------------|---------------|
| SeatViewModelTests | 🪑 Seat display logic | Constructor, property binding, factory methods, image source |
| MultiColumnViewModelTests | 📊 Multi-column layouts | Column management, item positioning |
| TableSelectionWorkflowTests | 🍽️ Table selection workflow | Add seat, assign resident, meal plan modal, customer info |

### 📦 Model Tests
| Test File | Coverage Area |
|-----------|---------------|
| CustomerDetailTests | 👤 Customer detail properties |
| CustomerModelTests | 👤 Customer model binding |
| PaymentModelsTests | 💳 Payment model initialization |
| SelectedTableDetailTests | 🍽️ Table selection state |
| TableModelTests | 🍽️ Table entity properties |
| LayoutTableDTOTests | 📐 Layout DTO mapping |

### 🔗 Integration Tests
| Test File | Purpose |
|-----------|---------|
| CustomerIntegrationTests | 👤 Customer property change tracking |
| PaymentIntegrationTests | 💳 End-to-end payment flows |
| TableLayoutAnalysisTests | 📐 Table layout positioning |
| DatabasePropertyChangeTests | 🗄️ DB change notifications |
| RoomRepositoryIntegrationTests | 🏠 Room data access |
| XamlDataBindingVerificationTests | 🔗 XAML binding paths |

### ⚡ Performance Tests
| Test | Threshold | Purpose |
|------|-----------|---------|
| Table_LargeCollection_PropertyChanges | ⏱️ 1000ms for 1000 tables | Bulk status updates |
| Customer_LargeCollection_NameChanges | ⏱️ 1000ms for 1000 customers | Dependent property recalc |
| Customer_FullNameComputation | ⏱️ 100ms for 1000 accesses | Computed property performance |

## 📝 Manual Testing Workflow

### 📖 Step 1: Understand the Feature

Before testing, gather:
- [ ] 📋 Feature requirements/user story
- [ ] ✅ Expected behavior
- [ ] ⚠️ Edge cases to consider
- [ ] 🔗 Related features that might be affected

### 📝 Step 2: Create Test Scenarios

For each feature, define:

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | ✅ Happy path | Normal usage | Success |
| 2 | ⚠️ Edge case | Boundary conditions | Handled gracefully |
| 3 | ❌ Error case | Invalid input | Error message shown |
| 4 | 🚫 Cancel/abort | User cancels | No changes saved |

### 📝 Step 3: Execute and Document

Record:
- ✅❌ Pass/Fail status
- 🔄 Actual behavior vs expected
- 📸 Screenshots if UI issue
- 📝 Debug output if available

## 🎯 Common Test Scenarios by Feature

### 💬 Dialog Testing

| Scenario | Verification |
|----------|--------------|
| 🪟 Dialog opens | Centered on owner, correct size |
| 🎯 Focus | First input field has focus |
| ⌨️ Keyboard | VirtualKeyboard appears on focus |
| ⚠️ Validation | Error shown for invalid input |
| 🚫 Cancel | Dialog closes, no data saved |
| ✅ Confirm | Data saved, dialog closes |
| ⎋ Escape key | Dialog closes (if supported) |

### 🍔 Order/Item Testing

| Scenario | Verification |
|----------|--------------|
| ➕ Add item | Item appears in correct seat |
| 🔧 Add modifier | Modifier attached to parent item |
| 🗑️ Delete item | Item removed, modifiers removed |
| 🔢 Change quantity | Quantity updates, price recalculates |
| 🔄 Move item | Item moves to new seat |
| 📝 Kitchen message | Message saved with "!" prefix |

### 🪑 Seat Management Testing

| Scenario | Verification |
|----------|--------------|
| ➕ Assign seat | Seat marker created (Flags=4) |
| 👤 Assign customer | Customer name shown (Flags=32) |
| 🔄 Reassign seat | Old marker removed, new created |
| 🗑️ Remove seat | Marker deleted, items remain |
| 👥 Multiple seats | Each seat has unique marker |

#### 🧪 SeatViewModel Unit Tests

| Scenario | Verification |
|----------|--------------|
| 🆕 Default constructor | All properties initialized to defaults |
| ⚙️ Parameterized constructor | All parameters correctly assigned |
| 📡 Property changed notifications | PropertyChanged fires for all bindable properties |
| 🏭 CreateFromLayout factory | Correct position based on shape and seat count |
| 🖼️ RefreshImageSource | Correct image for selected/occupied/empty states |

#### 🔄 TableSelectionWorkflow Tests

| Scenario | Verification |
|----------|--------------|
| ➕ Add seat under capacity | Seat added, positions recalculated |
| 🚫 Add seat at max capacity | No seat added, service not called |
| 👥 Assign resident (multiple meal plans) | Modal shown for selection |
| 👤 Assign resident (single meal plan) | Auto-select, skip modal |
| 📋 Customer info panel update | Correct customer details after seat selection |
| 👥 Second customer to table | Both seats appear in Current Orders |

### 💳 Payment Testing

| Scenario | Verification |
|----------|--------------|
| ✂️ Split by seat | Each seat totaled correctly |
| 🏷️ Apply discount | Discount reflected in total |
| 🍽️ Meal plan | Balance deducted, item flagged |
| 🧾 Print receipt | All items, modifiers listed |

#### 🔗 Extended Payment Scenarios (Integration Tests)

| Scenario | Verification |
|----------|--------------|
| 💵 Cash payment end-to-end | Transaction approved, retrievable, in sale transactions |
| 💳 Credit card with void | Authorization received, void successful, status = Voided |
| ↩️ Refund processing | Original payment approved, refund created with negative amount |
| 💰 Tip calculation | 15%/18%/20%/22% suggestions accurate |
| ✏️ Tip adjustment | Post-payment tip modification successful |

#### 🔍 Payment Debug Patterns
```
[PaymentService] PROCESS_START saleId=123 type=Cash amount=45.99
[PaymentService] PROCESS_END transactionId=TXN456 status=Approved
[PaymentService] VOID_START transactionId=TXN456
[PaymentService] VOID_END status=Voided
```

### 💰 Auto-Flow Discount Testing

| Scenario | Verification |
|----------|--------------|
| 🚫 No media config | Original totals returned unchanged |
| 📊 Percentage discount | Correct percentage applied to grand total |
| 💵 Dollar-off discount | Fixed amount deducted correctly |
| 🏢 Revenue center eligibility | Discount only applies to eligible centers |
| 🍽️ Meal plan eligibility | Discount only applies to eligible meal plans |
| 📦 Apply to all items | Discount distributed across all sale items |

#### 🗄️ Test Data Setup - Auto-Flow
```sql
-- Check auto-flow discount configuration
SELECT MediaIndex, DiscountApplyToAll, DiscountFlag, RevenueCenterFlag, MealPlanFlag
FROM SIC_MediaAutoFlowDiscount
WHERE SiteId = @SiteId;

-- Check eligible revenue centers
SELECT RevenueCenterIndex
FROM SIC_MediaAutoFlowDiscountRevenueCenter
WHERE MediaIndex = @MediaIndex;
```

### 🍽️ Auto-Gratuity Testing

| Scenario | Verification |
|----------|--------------|
| 🚫 Null applicable rule | Returns zero gratuity |
| ⚠️ Null connection | Throws ArgumentNullException |
| 🚫 No active taxes | Returns zero tax on gratuity |
| 🏷️ Tax flag matching | Correct taxes applied based on flag |
| 📊 Gratuity calculation | Percentage correctly applied to eligible items |
| 🔢 Order type filtering | Only applicable order types receive gratuity |

#### 🔍 Auto-Gratuity Debug Patterns
```
[AutoGratuityService] CALCULATE_START orderType=1 revCenter=2
[AutoGratuityService] ELIGIBLE_ITEMS count=5 total=4500
[AutoGratuityService] GRATUITY_APPLIED amount=900 (20%)
```

### 💵 Device Cashout Report Testing

| Scenario | Verification |
|----------|--------------|
| ✅ Valid date range | Report generates with all breakdowns |
| 📭 Empty breakdowns | Zeroed totals returned |
| ⚠️ Invalid currency strings | Gracefully returns $0.00 |
| 🚫 Null breakdowns | Empty report returned |
| ❌ Null start/end date | ArgumentException thrown |

#### 🗄️ Verification Queries - Device Cashout
```sql
-- Verify cashout report data
SELECT
    SUM(CashReceived) AS TotalCash,
    SUM(Tips) AS TotalTips,
    COUNT(DISTINCT CheckNumber) AS CheckCount
FROM Sale s
JOIN Payment p ON s.SaleId = p.SaleId
WHERE s.EmployeeId = @EmpId
  AND s.StartDate BETWEEN @StartDate AND @EndDate;
```

### 📐 Table Layout Testing

The SeatLayoutCalculator handles seat positioning for all 10 shape types:

| ShapeType | Name | Layout Algorithm |
|-----------|------|-----------------|
| 0 | ▭ SmallRectangleH | Rectangular (horizontal) |
| 1 | ▭ LargeRectangleH | Rectangular (horizontal) |
| 2 | ◇ SmallDiamond | Diamond |
| 3 | ◇ LargeDiamond | Diamond |
| 4 | ○ SmallCircle | Circular |
| 5 | ○ LargeCircle | Circular |
| 6 | ▯ SmallRectangleV | Rectangular (vertical) |
| 7 | ▯ LargeRectangleV | Rectangular (vertical) |
| 8 | □ SmallSquare | Square |
| 9 | □ LargeSquare | Square |

| Scenario | Verification |
|----------|--------------|
| 📍 Seat positioning | All seats within canvas bounds |
| 🔄 Rotation angles | Seats face center (0-360 degrees) |
| 🚫 No overlaps | Seat centers > 20 pixels apart |
| 🔀 Shape routing | Correct algorithm for each shape type |

### 📡 SignalR Real-Time Testing

| Event | Trigger | Expected UI Update |
|-------|---------|-------------------|
| 🔄 Sale updated | Payment processed on another terminal | Order list refreshes |
| ➕ Item added | Item added from kitchen | Item appears in current order |
| 🍽️ Table status change | Table closed elsewhere | Table layout updates |

#### 🔍 SignalR Debug Patterns
```
[PosSignalRClient] CONNECTED hubUrl=https://...
[SignalRDbChangeNotifier] DB_CHANGE table=Sale id=abc123
[OrderingViewModel] SIGNALR_UPDATE refreshing orders
```

## 🔍 Debug Output Verification

When testing, check VS Output window for:

```
[ClassName] ACTION_START param=value
[ClassName] ACTION_END result=success
```

### 📝 Expected Debug Patterns

**🍔 Item Addition:**
```
[OrderingViewModel] ADD_ITEM_START item=Burger seat=3 customerNumber=4727
[OrderingService] SAVE_ITEM saleItemId=abc123
[OrderingViewModel] ADD_ITEM_END success=true
```

**🪑 Seat Selection:**
```
[OrderingViewModel] SELECT_SEAT seat=3 customerNumber=4727
[GlobalStateService] STATE_UPDATE SelectedSeatNumber=3
```

**💬 Dialog Flow:**
```
[NameCheckDialog] Opening dialog
[NameCheckDialog] User input: "Table 5"
[NameCheckDialog] Save clicked, result=true
```

## 🗄️ Database Verification Queries

### 📦 Check Items for Sale
```sql
SELECT ItemIndex, ReceiptDescription, Flags, CustomerNumber, BasePrice
FROM SaleItem
WHERE SaleId = @SaleId
ORDER BY ItemIndex;
```

### 🪑 Check Seat Markers
```sql
SELECT BasePrice AS SeatNumber, ReceiptDescription, CustomerNumber
FROM SaleItem
WHERE SaleId = @SaleId AND Flags = 4
ORDER BY BasePrice;
```

### 📝 Check Kitchen Messages
```sql
SELECT ReceiptDescription, ParentIndex, CustomerNumber
FROM SaleItem
WHERE SaleId = @SaleId
  AND Flags = 32
  AND ReceiptDescription LIKE '!%';
```

### ⚠️ Check for Duplicates
```sql
SELECT BasePrice, COUNT(*) AS DuplicateCount
FROM SaleItem
WHERE SaleId = @SaleId AND Flags = 4
GROUP BY BasePrice
HAVING COUNT(*) > 1;
```

## 🧪 Test Data Setup

### ➕ Create Test Sale
```sql
DECLARE @SaleId UNIQUEIDENTIFIER = NEWID();
INSERT INTO Sale (SaleId, CheckNumber, StartDate, EmployeeId)
VALUES (@SaleId, 999, GETDATE(), 1);
SELECT @SaleId AS TestSaleId;
```

### 🪑 Add Test Seat Marker
```sql
INSERT INTO SaleItem (SaleItemId, SaleId, ItemIndex, ReceiptDescription, BasePrice, Flags, CustomerNumber)
VALUES (NEWID(), @SaleId, 1, 'Seat 1', 1, 4, 1001);
```

### 🗑️ Cleanup Test Data
```sql
DELETE FROM SaleItem WHERE SaleId = @SaleId;
DELETE FROM Sale WHERE SaleId = @SaleId;
```

## ✅ Regression Checklist

Before release, verify:

### 🍔 Core Ordering
- [ ] ➕ Add item to order
- [ ] 🔧 Add item with modifiers
- [ ] 🗑️ Delete item
- [ ] 🔢 Change item quantity
- [ ] 🚫 Void item

### 🪑 Seat Management
- [ ] ➕ Create new seat
- [ ] 👤 Assign customer to seat
- [ ] 🔄 Move item between seats
- [ ] 🗑️ Remove customer from seat

### 💬 Dialogs
- [ ] 📝 Name Check dialog
- [ ] 🔢 Quantity Input dialog
- [ ] 🗑️ Delete Confirmation dialog
- [ ] 📝 Message to Kitchen dialog
- [ ] 🔧 Modifier Selection dialog

### 🧭 Navigation
- [ ] 🍽️ Table selection
- [ ] 📋 Menu navigation
- [ ] 📁 Category switching
- [ ] 🔍 Search functionality

### 💳 Payment
- [ ] 💵 Cash payment
- [ ] 💳 Card payment
- [ ] ✂️ Split payment
- [ ] 🏷️ Apply discount
- [ ] 🍽️ Meal plan payment

### 💰 Auto-Flow & Gratuity
- [ ] ✅ Auto-flow discount applies correctly
- [ ] 🏢 Discount respects revenue center eligibility
- [ ] 👥 Auto-gratuity calculates for large parties
- [ ] 🧾 Gratuity tax calculated correctly

### 💵 Device Cashout
- [ ] 📊 Employee cashout report generates
- [ ] 📋 All payment breakdowns populated
- [ ] 💰 Tips and gratuities totaled correctly
- [ ] 📋 Open checks listed

### 📡 SignalR Communication
- [ ] 🔗 Hub connects on startup
- [ ] 🔄 Database changes trigger UI updates
- [ ] 🔄 Connection recovers after network issues

### 📐 Table Layout
- [ ] 🔷 All shape types display correctly
- [ ] 🪑 Seat positions calculate for 1-8 seats
- [ ] 🔄 Rotation angles point seats toward table center

## 🐛 Bug Report Template

```markdown
## 🐛 Bug Description
[Clear description of the issue]

## 📝 Steps to Reproduce
1. Step one
2. Step two
3. Step three

## ✅ Expected Behavior
[What should happen]

## ❌ Actual Behavior
[What actually happens]

## 🖥️ Environment
- Build: [version/commit]
- Database: [local/dev/prod]
- User: [employee name/ID]

## 📸 Screenshots/Logs
[Attach debug output, screenshots]

## ⚠️ Severity
- [ ] 🔴 Critical - System unusable
- [ ] 🟠 High - Major feature broken
- [ ] 🟡 Medium - Feature impaired
- [ ] 🟢 Low - Minor issue
```

## ✅ Test Verification Checklist

For each test:

- [ ] 🔧 **Preconditions met** - System in correct state
- [ ] 📝 **Steps followed** - Exact sequence executed
- [ ] ✅ **Result verified** - UI shows expected state
- [ ] 🗄️ **Database verified** - Data saved correctly
- [ ] 📝 **Debug output checked** - No errors in log
- [ ] 🗑️ **Cleanup done** - Test data removed

## ⚠️ Common Issues Found in Testing

| Issue | Symptom | Check |
|-------|---------|-------|
| ❌ Wrong seat | CustomerNumber = 0 | GlobalStateService.SelectedCustomerNumber |
| ⚠️ Duplicate markers | Dictionary error | ROW_NUMBER() in query |
| 🔄 UI not updating | Stale data shown | PropertyChanged notification |
| ⌨️ Keyboard not showing | No popup on focus | VirtualKeyboardBehavior timing |
| 💬 Dialog not closing | Hangs after save | DialogResultRequested event |

## 📊 Output Format

When reporting test results:

1. **📋 Test Summary**
   - 🔢 Total scenarios: X
   - ✅ Passed: X
   - ❌ Failed: X
   - 🚫 Blocked: X

2. **❌ Failed Tests**
   - 📝 Scenario name
   - 🔄 Expected vs Actual
   - 🔍 Root cause (if known)

3. **💡 Recommendations**
   - 🔧 Fixes needed
   - 🔍 Areas needing more testing

Always address the user as **Almel**.
