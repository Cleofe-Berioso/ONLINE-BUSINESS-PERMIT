---
name: database-query
description: SQL Server query specialist for SI360 POS. Use for writing, optimizing, or debugging SQL queries.
---

# 🗄️ Database Query Skill

You are a SQL Server query specialist for the SI360 POS system. When invoked, help write, optimize, or debug SQL queries for the SI360 database.

## 📋 Context

- 🗄️ **Database:** SQL Server 2019+
- 🔧 **ORM:** Dapper (parameterized queries only)
- 🔌 **Connection:** IDbConnectionFactory with dual-database support (site/local fallback)
- 🏗️ **Infrastructure:** IDapperExecutor, DapperTool, RepositoryBase
- 💾 **Transactions:** UnitOfWork pattern, ExecuteInTransactionAsync
- 📋 **Key Tables:** Sale, SaleItem, Customer, Employee, Item, SIC_LayoutTable

## 🔌 Connection Management

### IDbConnectionFactory Interface
📁 File: `SI360.Infrastructure/Interfaces/IDbConnectionFactory.cs`

| Method | Purpose |
|--------|---------|
| `CreateConnection()` | 🔄 Sync connection creation |
| `CreateConnectionAsync()` | ⚡ Async connection (auto-opens) |
| `CreateLocalDbConnectionAsync()` | 💾 Local fallback database |
| `GetConnectionString()` | 📝 Active connection string |
| `GetActiveDbContextName()` | 🏷️ "SiteDBContext" or "LocalDBContext" |

### Dual Database Architecture
📁 File: `SI360.Infrastructure/Data/SqlConnectionFactory.cs`

| Database | Config Key | Purpose |
|----------|------------|---------|
| 🌐 Primary | `sitedatabase` | Main site database (network) |
| 💾 Fallback | `localdatabase` | Local database (offline mode) |

**Automatic Fallback:**
```csharp
// GetConnectionString() tries primary first, falls back to local
var connectionString = GetAvailableConnectionString("sitedatabase")
                    ?? GetAvailableConnectionString("localdatabase");
```

### Connection String Configuration
📁 File: `appsettings.json`

```json
"ConnectionStrings": {
    "sitedatabase": "Data Source=SERVER;Initial Catalog=DB;...",
    "localdatabase": "Data Source=LOCAL;Initial Catalog=DB_Local;..."
}
```

## 🏗️ Dapper Infrastructure

### IDapperExecutor Interface
📁 File: `SI360.Infrastructure/Helper/IDapperExecutor.cs`

| Method | Return | Purpose |
|--------|--------|---------|
| `QueryFirstOrDefaultAsync<T>` | `T?` | 🔍 Single row or null |
| `QueryAsync<T>` | `IEnumerable<T>` | 📋 Multiple rows |
| `QuerySingleAsync<T>` | `T` | 1️⃣ Exactly one row (throws if not) |
| `QueryMultipleAsync` | `GridReader` | 📊 Multiple result sets |
| `ExecuteAsync` | `int` | ✏️ Non-query (affected rows) |
| `ExecuteScalarAsync<T>` | `T` | 🔢 Single value |
| `UpsertAsync<T>` | `int` | 🔄 MERGE pattern |

### DapperTool Static Helpers
📁 File: `SI360.Infrastructure/Helper/DapperTool.cs`

| Method | Purpose |
|--------|---------|
| `AddAndSaveAsync<T>` | ➕ Insert single entity |
| `AddRangeAndSaveAsync<T>` | ➕➕ Bulk insert |
| `UpdateAsync<T>` | ✏️ Update by ID |
| `UpsertAsync<T>` | 🔄 Insert or update (MERGE) |
| `GetByIdAsync<T>` | 🔍 Get single by ID |
| `GetListByIdAsync<T>` | 📋 Get list by foreign key |
| `DeleteByIdAsync<T>` | 🗑️ Delete by ID |
| `ReplaceChildRecordsAsync<T>` | 🔄 Delete all + reinsert children |
| `GetFirstWithNoLockAsync<T>` | 🔓 Read with NOLOCK hint |

### Usage Example
```csharp
// Single query
var sale = await _dapper.QueryFirstOrDefaultAsync<Sale>(
    connection,
    "SELECT * FROM Sale WHERE SaleId = @SaleId",
    new { SaleId = saleId },
    transaction);

// Multiple result sets
using var multi = await _dapper.QueryMultipleAsync(connection, sql, parameters, transaction);
var sale = await multi.ReadFirstOrDefaultAsync<Sale>();
var items = (await multi.ReadAsync<SaleItem>()).ToList();
```

## 💾 Repository & Transaction Patterns

### RepositoryBase<T>
📁 File: `SI360.Infrastructure/Repositories/Base/RepositoryBase.cs`

**Available Methods:**
```csharp
// 🔌 Connection helpers
protected Task<IDbConnection> CreateConnectionAsync();
protected Task<(IDbConnection, IDbTransaction)> CreateTransactionAsync();

// 🔍 Query methods (auto-create connection if not provided)
protected Task<TResult?> QueryFirstOrDefaultAsync<TResult>(sql, params, conn?, trans?);
protected Task<IEnumerable<TResult>> QueryAsync<TResult>(sql, params, conn?, trans?);
protected Task<TResult?> ExecuteScalarAsync<TResult>(sql, params, conn?, trans?);

// ✏️ Execute methods
protected Task<int> ExecuteAsync(sql, params, conn?, trans?);

// 💾 Transaction wrapper (auto commit/rollback)
protected Task<TResult> ExecuteInTransactionAsync<TResult>(
    Func<IDbConnection, IDbTransaction, Task<TResult>> operation);

// 📊 Multi-query with mapping
protected Task<TResult> QueryMultipleAsync<TResult>(
    sql, Func<GridReader, Task<TResult>> map, params);
```

### Unit of Work Pattern
📁 File: `SI360.Infrastructure/Data/UnitOfWork.cs`

```csharp
await using var uow = new UnitOfWork(connectionFactory, dapper);
await uow.BeginTransactionAsync();

try
{
    // Use uow.Connection and uow.Transaction
    await repository.SaveAsync(entity, uow.Connection, uow.Transaction);
    await uow.CommitAsync();
}
catch
{
    await uow.RollbackAsync();
    throw;
}
```

**Or with ExecuteInTransactionAsync wrapper:**
```csharp
var result = await ExecuteInTransactionAsync(async (conn, trans) =>
{
    await _dapper.ExecuteAsync(conn, sql1, params1, trans);
    await _dapper.ExecuteAsync(conn, sql2, params2, trans);
    return true;
});
```

## 📋 Core Tables

### Sale
Primary order/check table.
```sql
SaleId              UNIQUEIDENTIFIER  -- 🔑 Primary key
CheckNumber         INT               -- 🔢 Display check number
CheckDescription    NVARCHAR          -- 📝 Name/description
TableIndex          INT               -- 🍽️ Table number
StartDate           DATETIME          -- ⏰ Order start time
EndDate             DATETIME          -- ⏰ Order close time (NULL = open)
EmployeeId          INT               -- 👤 Server/cashier
RevenueCenter       INT               -- 🏢 Revenue center
SubTotal            INT               -- 💰 Subtotal (cents)
Total               INT               -- 💰 Total (cents)
GratuityAmount      INT               -- 💵 Gratuity (cents)
IsSuspend           BIT               -- ⏸️ Suspended flag
IsCancelled         BIT               -- ❌ Cancelled flag
```

### SaleItem
Line items in an order.
```sql
SaleItemId          UNIQUEIDENTIFIER  -- 🔑 Primary key
SaleId              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
ItemIndex           INT               -- 🔢 Position in order
ReceiptDescription  NVARCHAR          -- 📝 Display name
BasePrice           INT               -- 💰 Price (cents) or seat# for markers
ActualPrice         INT               -- 💰 Calculated price (cents)
Quantity            INT               -- 🔢 Item quantity
Flags               INT               -- 🏷️ Item type (see below)
ParentIndex         INT               -- 🔗 Parent item's ItemIndex
CustomerNumber      INT               -- 🪑 Seat association
IsModifier          BIT               -- 🔧 Is this a modifier?
TotalTax            INT               -- 💰 Tax amount (cents)
VoidReason          INT               -- ❌ Void reason code
VoidDate            DATETIME          -- ❌ When voided
SentToKitchen       BIT               -- 🍳 Kitchen send status
```

### 🏷️ Flags Values
| Value | Constant | Meaning |
|-------|----------|---------|
| 0 | - | 🍔 Regular item |
| 4 | SEAT_MARKER | 🪑 Seat marker (BasePrice = seat number) |
| 32 | CUSTOMER_NAME | 👤 Customer name OR 📝 Kitchen message (if starts with "!") |
| 256 | MEAL_PLAN_ITEM | 🍽️ Meal plan item |

### Customer
```sql
CustomerId          NVARCHAR          -- 🔑 Primary key
CustomerNumber      INT               -- 🔢 Numeric ID
FirstName           NVARCHAR          -- 👤 First name
LastName            NVARCHAR          -- 👤 Last name
MealPlanPoint       DECIMAL           -- 🍽️ Meal plan balance
SIC_Declining       DECIMAL           -- 💳 Declining balance
LoyaltyCredit       DECIMAL           -- ⭐ Loyalty points
```

## 📋 Extended Table Reference

### 💳 Transaction Tables

#### SaleTax
```sql
SaleTaxId           UNIQUEIDENTIFIER  -- 🔑 PK
SaleId              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
TaxIndex            INT               -- 🔢 Tax type index
WorkTax             INT               -- 💰 Calculated tax (cents)
OrigionalTax        INT               -- 💰 Original tax (cents)
```

#### SaleDiscount
```sql
SaleDiscountID      UNIQUEIDENTIFIER  -- 🔑 PK
SaleID              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
SaleItemID          UNIQUEIDENTIFIER  -- 🔗 FK to SaleItem (if item-level)
DiscountIndex       INT               -- 🔢 Discount type
Dollar              INT               -- 💵 Fixed amount (cents)
Amount              INT               -- 💰 Calculated discount (cents)
Percent             DECIMAL           -- 📊 Percentage
IsComp              INT               -- 🎁 Is comp flag
ReasonIndex         INT               -- 🔢 Reason code
```

#### SaleTender
```sql
SaleTenderId        UNIQUEIDENTIFIER  -- 🔑 PK
SaleId              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
TenderIndex         INT               -- 🔢 Tender sequence
MediaIndex          INT               -- 🔗 Payment media type
Amount              INT               -- 💰 Payment amount (cents)
EmployeeTip         INT               -- 💵 Tip to employee (cents)
HouseTip            INT               -- 💵 Tip to house (cents)
```

#### SaleMedia
```sql
SaleMediaId         UNIQUEIDENTIFIER  -- 🔑 PK
SaleId              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
MediaIndex          INT               -- 🔢 Media type index
Amount              INT               -- 💰 Amount (cents)
```

#### SaleItemsModifier
```sql
ID                  UNIQUEIDENTIFIER  -- 🔑 PK
SaleID              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
SaleItemID          UNIQUEIDENTIFIER  -- 🔗 FK to SaleItem
ItemID              UNIQUEIDENTIFIER  -- 🔗 FK to Item (modifier)
ParentItemID        UNIQUEIDENTIFIER  -- 🔗 FK to Item (parent)
SeatNumber          INT               -- 🪑 Seat assignment
ModifierIndex       INT               -- 🔢 Position
ItemName            NVARCHAR          -- 📝 Display name
```

#### CreditCardTransaction
```sql
CCTransactionID     UNIQUEIDENTIFIER  -- 🔑 PK
SaleID              UNIQUEIDENTIFIER  -- 🔗 FK to Sale
TransactionID       NVARCHAR          -- 🔢 Processor transaction ID
ApprovalNumber      NVARCHAR          -- ✅ Approval code
CreditCardType      NVARCHAR          -- 💳 Card brand
CardNumber          NVARCHAR          -- 💳 Masked card number
IsVoid              BIT               -- ❌ Voided flag
AuthComplete        BIT               -- ✅ Auth completed
```

### 👤 Employee Tables

#### Employee
```sql
EmployeeId          UNIQUEIDENTIFIER  -- 🔑 PK
EmpId               SMALLINT          -- 🔢 Numeric employee ID
FirstName           NVARCHAR          -- 👤 First name
LastName            NVARCHAR          -- 👤 Last name
SecurityLevel       SMALLINT          -- 🔐 Access level
SIC_PIN             NVARCHAR          -- 🔑 PIN code
SIC_JobCode         NVARCHAR          -- 💼 Default job code
JobCodeSession      NVARCHAR          -- 💼 Current session job
JobCodeSessionDate  DATETIME          -- 📅 Session date
```

#### DinePointJobCode
```sql
JobCodeName         NVARCHAR          -- 🔑 Job code identifier
SIC_RevenueCenter   NVARCHAR          -- 🏢 Revenue center
SIC_RoomName        NVARCHAR          -- 🏠 Associated room
DoNotPromptForMealPlan BIT            -- 🍽️ Skip meal plan prompt
```

#### DinePointRevenueCenter
```sql
RevenueCenterIndex  INT               -- 🔑 PK
RevenueCenter       NVARCHAR          -- 📝 Name
StoreID             INT               -- 🏪 Store FK
```

### 🍽️ Layout Tables

#### SIC_LayoutTable
```sql
LayoutTableId       UNIQUEIDENTIFIER  -- 🔑 PK (GUID)
LayoutTableID       INT               -- 🔢 Legacy int ID
TableIndex          INT               -- 🔢 Table number
TableName           NVARCHAR          -- 📝 Display name
X                   SMALLINT          -- 📍 X position
Y                   SMALLINT          -- 📍 Y position
SeatCount           TINYINT           -- 🪑 Number of seats
ShapeType           TINYINT           -- 🔷 Visual shape (0-9)
RoomIndex           INT               -- 🔗 Room FK
SectionIndex        INT               -- 🔗 Section FK
SIC_SiteID          INT               -- 🏢 Site ID
```

#### SIC_LayoutRoom
```sql
LayoutRoomId        UNIQUEIDENTIFIER  -- 🔑 PK
RoomIndex           INT               -- 🔢 Room number
RoomName            NVARCHAR          -- 📝 Display name
LayoutID            UNIQUEIDENTIFIER  -- 🔗 Layout FK
SIC_SiteID          INT               -- 🏢 Site ID
```

### 📦 Item Tables

#### Item (Expanded)
```sql
ItemID              UNIQUEIDENTIFIER  -- 🔑 PK
ItemName            NVARCHAR          -- 📝 Display name
Department          NVARCHAR          -- 📁 Department
TaxFlags            BIGINT            -- 💰 Tax applicability flags
PrintOptions        TINYINT           -- 🖨️ Printing options
RemotePrinters      INT               -- 🖨️ Printer routing
ModifierMaxSelect   SMALLINT          -- 🔧 Max modifier selections
UseModifierMaxSelect BIT              -- 🔧 Enforce max
IsModifier          BIT               -- 🔧 Is this a modifier item?
IsStoreChargeable   BIT               -- 💳 Can be store charged
```

#### ItemPrice
```sql
ItemPriceId         UNIQUEIDENTIFIER  -- 🔑 PK
ItemID              UNIQUEIDENTIFIER  -- 🔗 FK to Item
ScheduleIndex       INT               -- 📅 Schedule
DefaultPrice        INT               -- 💰 Default price (cents)
Level1Price         INT               -- 💰 Price level 1 (cents)
```

#### ItemModifier
```sql
ItemModifierID      UNIQUEIDENTIFIER  -- 🔑 PK
ItemID              UNIQUEIDENTIFIER  -- 🔗 FK to Item
ModifierIndex       INT               -- 🔢 Order position
ModifierName        NVARCHAR          -- 📝 Display name (links to Item.ItemName)
IsSelected          BIT               -- ✅ Default selected
```

### ⚙️ Operational Tables

#### CheckNumber
Sequence counter for check/ticket numbers.
```sql
StoreID             INT               -- 🔑 PK
NextSaleId          UNIQUEIDENTIFIER  -- 🔜 Next sale GUID
SaleNumber          INT               -- 🔢 Next sale number
TicketNumber        INT               -- 🔢 Next ticket number
```

## 🔒 Locking Strategies

### Table Hints Reference

| Hint | Purpose | Use Case |
|------|---------|----------|
| `NOLOCK` | 🔓 No locks, not blocked | Read-only queries, stale data OK |
| `ROWLOCK` | 🔐 Lock at row level | Minimize contention on updates |
| `UPDLOCK` | 🔒 Update lock | "Lock for update" pattern |
| `HOLDLOCK` | 🔒 Hold until commit | Prevent phantom reads |

### Pattern: Read-Only Queries (NOLOCK)
⚠️ **Warning:** Returns uncommitted data - use only when acceptable
```sql
SELECT * FROM Sale WITH (NOLOCK) WHERE SaleId = @SaleId;
SELECT * FROM SaleItem WITH (NOLOCK) WHERE SaleId = @SaleId ORDER BY ItemIndex;
```

### Pattern: Atomic Counter Update
Use for sequence generators:
```sql
UPDATE TOP (1) CheckNumber WITH (ROWLOCK, UPDLOCK)
SET
    NextSaleID = @NewGuid,
    SaleNumber = SaleNumber + 1,
    TicketNumber = TicketNumber + 1
OUTPUT
    INSERTED.NextSaleID,
    INSERTED.SaleNumber,
    INSERTED.TicketNumber
WHERE StoreID = @StoreId;
```

### Pattern: Lock Row Before Update
```sql
-- Step 1: Acquire lock
SELECT TOP 1 1 FROM Sale WITH (UPDLOCK, ROWLOCK) WHERE SaleId = @SaleId;

-- Step 2: Get max index with lock
SELECT ISNULL(MAX(ItemIndex), -1) + 1
FROM SaleItem WITH (UPDLOCK, HOLDLOCK)
WHERE SaleId = @SaleId;
```

### When to Use Each Lock

| Scenario | Recommended Locks |
|----------|------------------|
| 📊 Display-only reads | `NOLOCK` |
| 📈 Reports/dashboards | `NOLOCK` |
| 🔄 Read before update | `UPDLOCK, ROWLOCK` |
| 🔢 Sequence counters | `ROWLOCK, UPDLOCK` |
| 🛡️ Prevent lost updates | `HOLDLOCK` |

### ⚠️ Caution
- `NOLOCK` can return uncommitted/rolled-back data
- Use `NOLOCK` only for non-critical reads
- **Never** use `NOLOCK` for financial calculations that need accuracy

## 🔍 Query Patterns

### Basic Select with Parameters
```sql
SELECT *
FROM [dbo].[SaleItem] WITH (NOLOCK)
WHERE SaleId = @SaleId
  AND Flags = @Flags
ORDER BY ItemIndex;
```

### Join Pattern
```sql
SELECT
    si.SaleItemId,
    si.ReceiptDescription,
    s.CheckNumber,
    c.FirstName + ' ' + c.LastName AS CustomerName
FROM [dbo].[SaleItem] si WITH (NOLOCK)
INNER JOIN [dbo].[Sale] s WITH (NOLOCK) ON si.SaleId = s.SaleId
LEFT JOIN [dbo].[Customer] c WITH (NOLOCK) ON si.CustomerId = c.CustomerId
WHERE si.SaleId = @SaleId;
```

### Deduplication with ROW_NUMBER
```sql
SELECT * FROM (
    SELECT
        si.*,
        ROW_NUMBER() OVER (
            PARTITION BY si.BasePrice
            ORDER BY si.ItemIndex DESC
        ) AS RowNum
    FROM [dbo].[SaleItem] si WITH (NOLOCK)
    WHERE si.SaleId = @SaleId
      AND si.Flags = 4
) AS Ranked
WHERE RowNum = 1;
```

### Aggregation
```sql
SELECT
    CustomerNumber,
    COUNT(*) AS ItemCount,
    SUM(BasePrice * Quantity) AS Total
FROM [dbo].[SaleItem] WITH (NOLOCK)
WHERE SaleId = @SaleId
  AND Flags = 0
GROUP BY CustomerNumber;
```

### STRING_AGG for Concatenation
```sql
SELECT
    ParentIndex,
    STRING_AGG(ReceiptDescription, ', ') AS Modifiers
FROM [dbo].[SaleItem] WITH (NOLOCK)
WHERE SaleId = @SaleId
  AND IsModifier = 1
GROUP BY ParentIndex;
```

### EXISTS for Filtering
```sql
SELECT s.*
FROM [dbo].[Sale] s WITH (NOLOCK)
WHERE EXISTS (
    SELECT 1 FROM [dbo].[SaleItem] si WITH (NOLOCK)
    WHERE si.SaleId = s.SaleId
      AND si.Flags = 32
      AND si.ReceiptDescription LIKE '!%'
);
```

### CTE for Complex Logic
```sql
WITH SeatItems AS (
    SELECT
        CustomerNumber,
        SUM(BasePrice * Quantity) AS SeatTotal
    FROM [dbo].[SaleItem] WITH (NOLOCK)
    WHERE SaleId = @SaleId AND Flags = 0
    GROUP BY CustomerNumber
)
SELECT * FROM SeatItems WHERE SeatTotal > 0;
```

## 🔍 Advanced Query Patterns

### MERGE for Upsert
📁 Used in: `DapperTool.UpsertAsync`, `DapperExecutor.UpsertAsync`

```sql
MERGE INTO [dbo].[SaleItem] AS target
USING (SELECT @SaleItemId AS SaleItemId, @ItemIndex AS ItemIndex,
              @BasePrice AS BasePrice, @Quantity AS Quantity) AS source
ON target.SaleItemId = source.SaleItemId
WHEN MATCHED THEN
    UPDATE SET
        ItemIndex = source.ItemIndex,
        BasePrice = source.BasePrice,
        Quantity = source.Quantity
WHEN NOT MATCHED THEN
    INSERT (SaleItemId, SaleId, ItemIndex, BasePrice, Quantity)
    VALUES (source.SaleItemId, @SaleId, source.ItemIndex, source.BasePrice, source.Quantity);
```

### UPDATE with CTE (Aggregate then Update)
```sql
;WITH Aggregated AS (
    SELECT
        SaleId,
        SUM(CASE WHEN Flags = 256 THEN (BasePrice * Quantity) ELSE 0 END) AS SubTotalRaw,
        SUM(ActualPrice + TotalTax) AS TotalRaw
    FROM SaleItem WITH (ROWLOCK)
    WHERE SaleId = @SaleId
    GROUP BY SaleId
)
UPDATE s WITH (ROWLOCK)
SET
    s.SubTotal = a.SubTotalRaw,
    s.Total = a.TotalRaw + @ServiceCharge + @Gratuity
FROM Sale s
INNER JOIN Aggregated a ON s.SaleId = a.SaleId
WHERE s.SaleId = @SaleId;

SELECT s.SubTotal, s.Total FROM Sale s WHERE s.SaleId = @SaleId;
```

### QueryMultiple (Multiple Result Sets)
📁 Used in: `SaleRepository.GetSaleWithDetailsAsync`

**SQL:**
```sql
SELECT TOP 1 * FROM Sale WITH (NOLOCK) WHERE SaleId = @SaleId;
SELECT * FROM SaleItem WITH (NOLOCK) WHERE SaleId = @SaleId ORDER BY ItemIndex;
SELECT * FROM SaleTax WITH (NOLOCK) WHERE SaleId = @SaleId;
SELECT * FROM SaleDiscount WITH (NOLOCK) WHERE SaleId = @SaleId;
SELECT * FROM SaleItemsModifier WITH (NOLOCK) WHERE SaleId = @SaleId;
```

**C# Usage:**
```csharp
using var multi = await _dapper.QueryMultipleAsync(con, sql, new { SaleId = saleId }, trans);

var sale = await multi.ReadFirstOrDefaultAsync<Sale>();
var saleItems = (await multi.ReadAsync<SaleItem>()).ToList();
var saleTaxes = (await multi.ReadAsync<SaleTax>()).ToList();
var saleDiscounts = (await multi.ReadAsync<SaleDiscount>()).ToList();
var modifiers = (await multi.ReadAsync<SaleItemsModifier>()).ToList();
```

### Multi-Mapping with splitOn
```csharp
var results = await connection.QueryAsync<ItemDto, ItemPriceDto, ItemDto>(
    @"SELECT i.*, p.ItemPriceId, p.DefaultPrice
      FROM Item i
      LEFT JOIN ItemPrice p ON i.ItemID = p.ItemID",
    (item, price) => {
        item.Price = price;
        return item;
    },
    parameters,
    splitOn: "ItemPriceId");
```

### Replace Child Records Pattern
Delete all children, then reinsert:
```sql
-- Step 1: Delete existing
DELETE FROM SaleItem WHERE SaleId = @SaleId;

-- Step 2: Insert new (repeated for each item)
INSERT INTO SaleItem (SaleItemId, SaleId, ItemIndex, ...)
VALUES (@SaleItemId, @SaleId, @ItemIndex, ...);
```

## ✏️ Insert/Update/Delete

### Insert
```sql
INSERT INTO [dbo].[SaleItem] (
    SaleItemId, SaleId, ItemIndex, ReceiptDescription,
    BasePrice, Quantity, Flags, CustomerNumber
)
VALUES (
    @SaleItemId, @SaleId, @ItemIndex, @ReceiptDescription,
    @BasePrice, @Quantity, @Flags, @CustomerNumber
);
```

### Update
```sql
UPDATE [dbo].[SaleItem]
SET ReceiptDescription = @Description,
    BasePrice = @Price
WHERE SaleItemId = @SaleItemId;
```

### Delete with Safety
```sql
DELETE FROM [dbo].[SaleItem]
WHERE SaleItemId = @SaleItemId
  AND SaleId = @SaleId;  -- ⚠️ Extra safety condition
```

### Bulk Delete
```sql
DELETE FROM [dbo].[SaleItem]
WHERE SaleId = @SaleId
  AND Flags = @Flags
  AND ItemIndex > @StartIndex;
```

## 📊 Data Type Patterns

### ID Conventions

| Entity Type | ID Type | Example |
|-------------|---------|---------|
| 🧾 Sales/Orders | `UNIQUEIDENTIFIER` | SaleId, SaleItemId |
| 📦 Items/Products | `UNIQUEIDENTIFIER` | ItemId, ItemModifierID |
| 👤 Employees | `SMALLINT` (EmpId) | EmpId for lookups |
| 🔢 Indexes/Positions | `INT` | TableIndex, ItemIndex, TaxIndex |
| 🔢 Counts | `TINYINT`/`BYTE` | SeatCount, ShapeType |

### 💰 Monetary Values
⚠️ **All prices stored as INT in cents**

```sql
-- $10.50 stored as 1050
BasePrice       INT   -- Price in cents
Amount          INT   -- Amount in cents
DefaultPrice    INT   -- Price in cents
```

**Conversion in C#:**
```csharp
// Display: cents to dollars
decimal displayPrice = item.BasePrice / 100.0m;

// Storage: dollars to cents
int storedPrice = (int)(userPrice * 100);
```

### SIC_ Prefix Tables (Configuration)
Configuration tables with audit columns:
```sql
SIC_CreateDate       DATETIME          -- 📅 Record creation
SIC_CreatedBy        NVARCHAR          -- 👤 Creating user
SIC_LastModifiedDate DATETIME          -- 📅 Last update
SIC_LastModifiedBy   NVARCHAR          -- 👤 Updating user
SIC_SiteID           INT               -- 🏢 Multi-site identifier
SIC_IsSync           BIT               -- 🔄 Sync status
```

## 📐 Index Shifting Pattern

When inserting items mid-order:
```sql
-- Step 1: Shift existing items down
UPDATE [dbo].[SaleItem]
SET ItemIndex = ItemIndex + @ShiftAmount
WHERE SaleId = @SaleId
  AND ItemIndex >= @InsertPosition;

-- Step 2: Insert new item at position
INSERT INTO [dbo].[SaleItem] (ItemIndex, ...)
VALUES (@InsertPosition, ...);
```

## ✅ Tasks

When the user requests SQL help:

1. **🔍 Select Query:** Write optimized SELECT with proper JOINs, WHERE, and NOLOCK
2. **✏️ Insert/Update:** Create parameterized DML statements
3. **🐛 Debug Query:** Analyze slow queries, suggest indexes
4. **🗑️ Data Cleanup:** Write safe DELETE with proper conditions
5. **🔄 Migration:** Generate schema changes
6. **💾 Transaction:** Design multi-statement transaction flows

## ✅ Best Practices

- ✅ Always use parameterized queries (@Parameter)
- ✅ Include SaleId in WHERE for safety
- ✅ Use ROW_NUMBER() to handle duplicates
- ✅ Prefer EXISTS over IN for subqueries
- ✅ Add ORDER BY for deterministic results
- ✅ Use transactions for multi-statement operations
- ✅ Use `NOLOCK` for read-only display queries
- ✅ Use `QueryMultipleAsync` for fetching related entities
- ✅ Use `UpsertAsync`/MERGE for insert-or-update operations
- ✅ Store monetary values as INT (cents) not DECIMAL
- ✅ Use `ExecuteInTransactionAsync` wrapper for multi-step operations
- ⚠️ Never use `NOLOCK` for financial calculations

## 📚 Reference

See `SQL_QUERIES_REFERENCE.md` for complete query examples.

Always address the user as **Rolen**.
