---
name: backend-service
description: Backend service specialist for SI360 POS. Use for creating repositories, services, DTOs, SignalR integration, and Dapper queries.
---

# 🔧 Backend Service Skill

You are a backend service specialist for the SI360 POS system. When invoked, help create or modify repository and service layer components following established patterns.

## 📋 Context

| Aspect | Technology |
|--------|------------|
| **Architecture** | Clean Architecture (Repository + Service layers) |
| **ORM** | Dapper (micro-ORM with IDapperExecutor wrapper) |
| **DI Container** | Microsoft.Extensions.DependencyInjection |
| **Resilience** | Polly AsyncRetryPolicy |
| **Logging** | Serilog via IErrorHandler |
| **Real-time** | SignalR (PosHub, PosSignalRClient) |
| **HTTP** | HttpClientService with System.Text.Json |
| **Database** | SQL Server with dual-database failover |

## 🏗️ Layer Structure

```
SI360.Infrastructure/
├── Data/
│   ├── SqlConnectionFactory.cs      # Dual-database connection management
│   └── UnitOfWork.cs                # Transaction coordination
├── Helper/
│   ├── DapperExecutor.cs            # Dapper wrapper implementation
│   ├── DapperTool.cs                # Static Dapper utilities
│   └── IDapperExecutor.cs           # Dapper abstraction interface
├── Interfaces/
│   ├── IDbConnectionFactory.cs      # Connection factory interface
│   ├── IDbChangeNotifier.cs         # SignalR notification interface
│   ├── IErrorHandler.cs             # Logging abstraction
│   └── IUnitOfWork.cs               # Unit of Work interface
├── IRepository/                      # Repository interfaces
├── IService/                         # Service interfaces
├── Repositories/
│   ├── Base/
│   │   └── RepositoryBase.cs        # Base repository with common methods
│   └── {Entity}Repository.cs        # Entity-specific implementations
├── Services/
│   ├── {Entity}Service.cs           # Service implementations
│   └── HttpClientService.cs         # REST API client
└── ServiceConfiguration.cs          # DI registration

SI360.SignalRHub/
├── Hubs/
│   └── PosHub.cs                    # SignalR server hub
├── Client/
│   └── PosSignalRClient.cs          # SignalR client
└── Notifiers/
    └── SignalRDbChangeNotifier.cs   # Database change broadcaster
```

## 🔌 Dependency Injection

### Service Lifetimes

| Registration | Lifetime | Reason |
|--------------|----------|--------|
| `IErrorHandler` | **Singleton** | Shared logging across app |
| `IDbConnectionFactory` | Scoped | Per-request connection management |
| `IDapperExecutor` | Scoped | Per-request Dapper operations |
| `IUnitOfWork` | Scoped | Per-request transaction scope |
| All Repositories | Scoped | Per-request data access |
| All Domain Services | Scoped | Per-request business logic |
| `PosSignalRClient` | **Singleton** | Shared SignalR connection |
| `IDbChangeNotifier` | **Singleton** | Shared notification channel |

### ServiceConfiguration.cs

```csharp
public static class ServiceConfiguration
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Error Handling (Singleton)
        services.AddSingleton<IErrorHandler, SerilogErrorHandler>();

        // Database (Scoped)
        services.AddScoped<IDbConnectionFactory>(provider =>
            new SqlConnectionFactory(configuration));
        services.AddScoped<IDapperExecutor, DapperExecutor>();

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<ISaleRepository, SaleRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ISeatRepository, SeatRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ITaxRepository, TaxRepository>();
        services.AddScoped<ITableRepository, TableRepository>();
        // ... 35+ repository registrations

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IOrderingService, OrderingService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ITaxService, TaxService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISeatService, SeatService>();
        // ... 38+ service registrations

        return services;
    }
}
```

## 🔗 Connection Factory Pattern

### IDbConnectionFactory Interface

```csharp
public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
    Task<IDbConnection> CreateConnectionAsync();
    Task<IDbConnection> CreateLocalDbConnectionAsync();
    string GetConnectionString();
    string GetActiveDbContextName();
}
```

### SqlConnectionFactory (Dual-Database Failover)

```csharp
public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly IConfiguration _configuration;
    private readonly string _primaryConnectionStringName = "sitedatabase";
    private readonly string _fallbackConnectionStringName = "localdatabase";

    public async Task<IDbConnection> CreateConnectionAsync()
    {
        var connectionString = GetConnectionString();
        var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        return connection;
    }

    public string GetConnectionString()
    {
        // Try primary, fall back to local if unavailable
        var primary = _configuration.GetConnectionString(_primaryConnectionStringName);
        if (IsDatabaseAvailable(primary))
            return primary;

        var fallback = _configuration.GetConnectionString(_fallbackConnectionStringName);
        if (IsDatabaseAvailable(fallback))
            return fallback;

        throw new InvalidOperationException("No available database connection.");
    }

    private bool IsDatabaseAvailable(string connectionString)
    {
        try
        {
            using var connection = new SqlConnection(connectionString);
            connection.Open();
            return connection.State == ConnectionState.Open;
        }
        catch { return false; }
    }
}
```

### Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "sitedatabase": "Data Source=SERVER;Initial Catalog=SiteDB;...",
    "localdatabase": "Data Source=.\\SQLEXPRESS;Initial Catalog=LocalDB;..."
  }
}
```

## 📦 Repository Pattern

### RepositoryBase Methods

| Method | Description |
|--------|-------------|
| `CreateConnectionAsync()` | Creates new database connection |
| `CreateTransactionAsync()` | Creates connection + transaction tuple |
| `QueryFirstOrDefaultAsync<T>()` | Single result query |
| `QueryAsync<T>()` | Multiple results query |
| `ExecuteScalarAsync<T>()` | Scalar value query |
| `ExecuteAsync()` | Non-query command (INSERT/UPDATE/DELETE) |
| `ExecuteInTransactionAsync<T>()` | Auto commit/rollback transaction |
| `QueryMultipleAsync<T>()` | Multiple result sets with mapping |

### RepositoryBase Implementation

```csharp
public abstract class RepositoryBase<TEntity> where TEntity : class
{
    protected readonly IDbConnectionFactory _connectionFactory;
    protected readonly IDapperExecutor _dapper;

    protected RepositoryBase(
        IDbConnectionFactory connectionFactory,
        IDapperExecutor dapper)
    {
        _connectionFactory = connectionFactory;
        _dapper = dapper;
    }

    protected async Task<IDbConnection> CreateConnectionAsync()
        => await _connectionFactory.CreateConnectionAsync();

    protected async Task<(IDbConnection connection, IDbTransaction transaction)> CreateTransactionAsync()
    {
        var connection = await _connectionFactory.CreateConnectionAsync();
        var transaction = connection.BeginTransaction();
        return (connection, transaction);
    }

    protected async Task<TResult> ExecuteInTransactionAsync<TResult>(
        Func<IDbConnection, IDbTransaction, Task<TResult>> operation)
    {
        using var connection = await CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            var result = await operation(connection, transaction);
            transaction.Commit();
            return result;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    protected async Task<TResult> QueryMultipleAsync<TResult>(
        string sql,
        Func<SqlMapper.GridReader, Task<TResult>> map,
        object? parameters = null,
        IDbConnection? connection = null,
        IDbTransaction? transaction = null)
    {
        if (connection != null)
        {
            using var gridReader = await connection.QueryMultipleAsync(sql, parameters, transaction);
            return await map(gridReader);
        }

        using var conn = await CreateConnectionAsync();
        using var gridReader2 = await conn.QueryMultipleAsync(sql, parameters);
        return await map(gridReader2);
    }
}
```

### Repository Interface Pattern

```csharp
public interface I{Entity}Repository
{
    Task<{Entity}?> GetByIdAsync(Guid id);
    Task<List<{Entity}>> GetAllAsync();
    Task<{Response}> CreateAsync({Request} request);
    Task<{Response}> UpdateAsync({Request} request);
    Task DeleteAsync(Guid id);
}
```

### Repository Implementation Example

```csharp
public class SeatRepository : RepositoryBase<SaleItem>, ISeatRepository
{
    public SeatRepository(
        IDbConnectionFactory connectionFactory,
        IDapperExecutor dapper)
        : base(connectionFactory, dapper) { }

    public async Task<List<SaleItem>> GetSeatMarkersAsync(Guid saleId)
    {
        const string sql = @"
            SELECT * FROM (
                SELECT *, ROW_NUMBER() OVER (
                    PARTITION BY BasePrice ORDER BY ItemIndex DESC
                ) AS RowNum
                FROM SaleItem WITH (NOLOCK)
                WHERE SaleId = @SaleId AND Flags = 4
            ) AS Ranked WHERE RowNum = 1";

        var results = await QueryAsync<SaleItem>(sql, new { SaleId = saleId });
        return results.ToList();
    }
}
```

## 💼 Service Pattern

### Service Interface Pattern

```csharp
public interface I{Entity}Service
{
    Task<{Response}> CreateAsync({Request} request);
    Task<{Response}> UpdateAsync({Request} request);
}
```

### Service Implementation Pattern

```csharp
public class {Entity}Service : I{Entity}Service
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly AsyncRetryPolicy _retryPolicy;
    private readonly IErrorHandler _errorHandler;
    private readonly IDbChangeNotifier _signalRNotifier;

    public {Entity}Service(
        I{Entity}Repository {entity}Repository,
        AsyncRetryPolicy retryPolicy,
        IErrorHandler errorHandler,
        IDbChangeNotifier signalRNotifier)
    {
        _{entity}Repository = {entity}Repository;
        _retryPolicy = retryPolicy;
        _errorHandler = errorHandler;
        _signalRNotifier = signalRNotifier;
    }

    public async Task<{Response}> CreateAsync({Request} request)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                var result = await _{entity}Repository.CreateAsync(request);

                // Broadcast change via SignalR
                await _signalRNotifier.NotifyAsync(new DbChangeEvent
                {
                    Table = "{Entity}",
                    Action = "INSERT",
                    Key = request.Id,
                    Timestamp = DateTime.UtcNow
                });

                await _errorHandler.LogInfoAsync(
                    $"{Entity} created: {request.Id}",
                    nameof({Entity}Service),
                    "System");

                return result;
            });
        }
        catch (Exception ex)
        {
            await _errorHandler.LogErrorAsync(ex,
                $"Failed to create {Entity}: {request.Id}",
                "System");
            throw;
        }
    }
}
```

### OrderingService Example (Real)

Shows: Multiple repositories, SignalR notifications, Polly retry, transaction management

```csharp
public class OrderingService : IOrderingService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IDbChangeNotifier _signalRNotifier;
    private readonly ISaleRepository _saleRepository;
    private readonly IItemRepository _itemRepository;
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly AsyncRetryPolicy _retryPolicy;
    private readonly IErrorHandler _errorHandler;
    private readonly IDapperExecutor _dapper;

    public async Task<bool> AddOrderItemAsync(int saleId, OrderItem item)
    {
        try
        {
            return await _retryPolicy.ExecuteAsync(async () =>
            {
                using var connection = await _connectionFactory.CreateConnectionAsync();
                using var transaction = connection.BeginTransaction();

                try
                {
                    // 1. Load existing sale with details
                    var (sale, items, taxes, discounts, modifiers) =
                        await _saleRepository.GetSaleWithDetailsAsync(
                            connection, transaction, saleGuid);

                    // 2. Create and insert new item
                    var newSaleItem = MapToSaleItem(item);
                    await _itemRepository.InsertSaleItemAsync(
                        connection, transaction, newSaleItem);

                    // 3. Recalculate totals
                    sale.SubTotal = items.Sum(i => i.BasePrice * i.Quantity);
                    sale.Total = sale.SubTotal + sale.Tax;

                    // 4. Save updated sale
                    await _saleRepository.SaveSaleWithDetailsAsync(
                        connection, transaction, sale, items, taxes, discounts, modifiers);

                    transaction.Commit();

                    // 5. Notify SignalR clients
                    await _signalRNotifier.NotifyAsync(new DbChangeEvent
                    {
                        Table = "SaleItem",
                        Action = "INSERT",
                        SaleId = saleGuid,
                        Timestamp = DateTime.UtcNow
                    });

                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            });
        }
        catch (Exception ex)
        {
            await _errorHandler.LogErrorAsync(ex,
                $"Error adding item to sale {saleId}", "System");
            return false;
        }
    }
}
```

### PaymentService Example (Real)

Shows: Strategy pattern for payment types, tip calculations

```csharp
public class PaymentService : IPaymentService
{
    public async Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request)
    {
        return request.PaymentType switch
        {
            PaymentType.Cash => await ProcessCashPaymentAsync(request),
            PaymentType.CreditCard => await ProcessCreditCardPaymentAsync(request),
            PaymentType.DebitCard => await ProcessCreditCardPaymentAsync(request),
            PaymentType.MobilePayment => await ProcessMobilePaymentAsync(request),
            PaymentType.GiftCard => await ProcessGiftCardPaymentAsync(request),
            _ => new PaymentResponse { IsSuccess = false, ErrorMessage = "Unsupported" }
        };
    }

    public async Task<TipSuggestions> CalculateTipSuggestionsAsync(decimal subtotal)
    {
        return new TipSuggestions
        {
            Tip15Percent = Math.Round(subtotal * 0.15m, 2),
            Tip18Percent = Math.Round(subtotal * 0.18m, 2),
            Tip20Percent = Math.Round(subtotal * 0.20m, 2),
            Tip22Percent = Math.Round(subtotal * 0.22m, 2)
        };
    }

    public async Task<PaymentResponse> VoidTransactionAsync(
        string transactionId, int employeeId) { ... }

    public async Task<PaymentResponse> RefundTransactionAsync(
        string transactionId, decimal amount, int employeeId) { ... }
}
```

## 🔄 Unit of Work Pattern

### IUnitOfWork Interface

```csharp
public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    IDbConnection Connection { get; }
    IDbTransaction Transaction { get; }
    bool IsTransactionActive { get; }

    // Lazy-loaded repository accessors
    ISeatRepository Seats { get; }
    ISaleRepository Sales { get; }
    IItemRepository Items { get; }
    IItemModifierRepository ItemModifiers { get; }
    ICustomerRepository Customers { get; }
    ISaleTaxRepository SaleTaxes { get; }
    IPaymentHelperRepository PaymentHelpers { get; }
    IDiscountRepository Discounts { get; }
    ISaleDiscountRepository SaleDiscounts { get; }

    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
    Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> operation);
    Task ExecuteInTransactionAsync(Func<Task> operation);
}
```

### UnitOfWork Implementation

```csharp
public class UnitOfWork : IUnitOfWork
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IDapperExecutor _dapper;

    private IDbConnection? _connection;
    private IDbTransaction? _transaction;

    // Lazy-loaded repositories
    private ISeatRepository? _seatRepository;
    private ISaleRepository? _saleRepository;

    public ISeatRepository Seats => _seatRepository
        ??= new SeatRepository(_connectionFactory, _dapper);

    public ISaleRepository Sales => _saleRepository
        ??= new SaleRepository(_dapper, _connectionFactory);

    public bool IsTransactionActive => _transaction != null;

    public async Task BeginTransactionAsync()
    {
        if (_connection != null)
            throw new InvalidOperationException("Transaction already started.");

        _connection = await _connectionFactory.CreateConnectionAsync();
        _transaction = _connection.BeginTransaction();
    }

    public async Task CommitAsync()
    {
        try
        {
            _transaction?.Commit();
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    public async Task RollbackAsync()
    {
        _transaction?.Rollback();
        await DisposeTransactionAsync();
    }

    public async Task<TResult> ExecuteInTransactionAsync<TResult>(
        Func<Task<TResult>> operation)
    {
        await BeginTransactionAsync();

        try
        {
            var result = await operation();
            await CommitAsync();
            return result;
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
    }
}
```

### Usage Examples

```csharp
// Option 1: Manual transaction control
await _unitOfWork.BeginTransactionAsync();
try
{
    var seat = await _unitOfWork.Seats.GetByIdAsync(seatId);
    await _unitOfWork.Sales.UpdateAsync(sale);
    await _unitOfWork.CommitAsync();
}
catch
{
    await _unitOfWork.RollbackAsync();
    throw;
}

// Option 2: Automatic transaction wrapper
var result = await _unitOfWork.ExecuteInTransactionAsync(async () =>
{
    await _unitOfWork.Seats.CreateAsync(newSeat);
    await _unitOfWork.Sales.UpdateAsync(sale);
    return sale;
});
```

## 🌐 HTTP Client Service

### IHttpClientService Interface

```csharp
public interface IHttpClientService
{
    Task<T?> GetAsync<T>(string url);
    Task<TResponse?> PostAsync<TRequest, TResponse>(string url, TRequest request);
    Task<TResponse?> PutAsync<TRequest, TResponse>(string url, TRequest request);
    Task<TResponse?> DeleteAsync<TResponse>(string url);
}
```

### HttpClientService Implementation

```csharp
public class HttpClientService : IHttpClientService, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public HttpClientService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T?> GetAsync<T>(string url)
    {
        try
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, _jsonOptions);
        }
        catch (HttpRequestException ex)
        {
            throw new HttpClientServiceException($"GET {url} failed", ex);
        }
        catch (JsonException ex)
        {
            throw new HttpClientServiceException($"JSON parse failed for GET {url}", ex);
        }
    }

    public async Task<TResponse?> PostAsync<TRequest, TResponse>(
        string url, TRequest request)
    {
        var jsonContent = JsonSerializer.Serialize(request, _jsonOptions);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<TResponse>(responseContent, _jsonOptions);
    }
}

public class HttpClientServiceException : Exception
{
    public HttpClientServiceException(string message) : base(message) { }
    public HttpClientServiceException(string message, Exception inner) : base(message, inner) { }
}
```

### DI Registration

```csharp
services.AddHttpClient<IHttpClientService, HttpClientService>(client =>
{
    client.BaseAddress = new Uri(configuration["ApiBaseUrl"]);
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

## 📡 SignalR Integration

### Architecture

```
UI Layer                    SignalR Hub              Other Tablets
    │                           │                         │
    └──► PosSignalRClient ────► PosHub ────► Broadcast ───┘
    │         │                    │                      │
    │    OnDbChanged          DbChanged                   │
    │         │                    │                      │
    └─── Dispatcher.Invoke ◄───────┴──────────────────────┘
```

### PosHub (Server)

```csharp
public class PosHub : Hub
{
    private static int _connectionCount = 0;

    public override async Task OnConnectedAsync()
    {
        _connectionCount++;
        var tabletId = Context.GetHttpContext()?.Request.Query["tabletId"];
        var ipAddress = Context.GetHttpContext()?.Connection.RemoteIpAddress;
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] ✓ TABLET CONNECTED - {tabletId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        _connectionCount--;
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] ✗ TABLET DISCONNECTED");
        await base.OnDisconnectedAsync(exception);
    }

    public async Task DbChanged(DbChangeEvent change)
    {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] 📡 Broadcasting: {change.Table} - {change.Action}");
        await Clients.All.SendAsync("DbChanged", change);
    }
}
```

### PosSignalRClient (Client)

```csharp
public class PosSignalRClient
{
    private HubConnection _connection;

    public async Task StartAsync(Action<DbChangeEvent> onDbChanged)
    {
        _connection = new HubConnectionBuilder()
            .WithUrl("http://192.168.4.196:9000/posHub")
            .WithAutomaticReconnect()
            .Build();

        _connection.On<DbChangeEvent>("DbChanged", change =>
        {
            // Marshal to UI thread for WPF
            Application.Current.Dispatcher.Invoke(() => onDbChanged(change));
        });

        await _connection.StartAsync();
    }

    public async Task SendDbChangeAsync(DbChangeEvent change)
    {
        if (_connection?.State == HubConnectionState.Connected)
        {
            await _connection.SendAsync("DbChanged", change);
        }
    }
}
```

### SignalRDbChangeNotifier

```csharp
public class SignalRDbChangeNotifier : IDbChangeNotifier
{
    private readonly PosSignalRClient _signalRClient;

    public async Task NotifyAsync(DbChangeEvent change)
    {
        await _signalRClient.SendDbChangeAsync(change);
    }
}
```

### DbChangeEvent Model

```csharp
public class DbChangeEvent
{
    public string Table { get; set; }           // Table name
    public string Action { get; set; }          // INSERT | UPDATE | DELETE
    public object Key { get; set; }             // Primary key or entity
    public Guid? SaleItemId { get; set; }
    public Guid? SaleId { get; set; }
    public int? SeatNumber { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
```

### DI Registration for SignalR

```csharp
// Singleton - shared connection for entire app
services.AddSingleton<PosSignalRClient>();
services.AddSingleton<IDbChangeNotifier, SignalRDbChangeNotifier>();
```

## 📊 DTO Patterns

### Request DTO

```csharp
public class {Action}{Entity}Request
{
    public Guid Id { get; set; }
    public string Property1 { get; set; }
    // ... other properties
}
```

### Response DTO

```csharp
public class {Action}{Entity}Response
{
    public {Entity}Dto Data { get; set; }
    public int StatusCode { get; set; }
    public string Message { get; set; }
}
```

## 🗃️ SQL Patterns

### Parameterized Query

```csharp
var result = await _dapper.QueryFirstOrDefaultAsync<Entity>(
    connection,
    "SELECT * FROM Table WITH (NOLOCK) WHERE Id = @Id",
    new { Id = id },
    transaction);
```

### Multiple Results (QueryMultiple)

```csharp
using var multi = await connection.QueryMultipleAsync(sql, parameters, transaction);
var parent = await multi.ReadSingleOrDefaultAsync<Parent>();
var children = (await multi.ReadAsync<Child>()).ToList();
```

### Deduplication (ROW_NUMBER)

```sql
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY Key ORDER BY Index DESC) AS RowNum
    FROM Table WITH (NOLOCK) WHERE Condition
) AS Ranked WHERE RowNum = 1;
```

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   SI360.UI (WPF ViewModels)                  │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
     ┌──────▼──────┐               ┌──────────▼──────────┐
     │ HTTP Client │               │   SignalR Client    │
     │ (REST API)  │               │  (PosSignalRClient) │
     └──────┬──────┘               └──────────┬──────────┘
            │                                 │
┌───────────▼─────────────────────────────────▼───────────────┐
│                  SI360.Infrastructure                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │           ServiceConfiguration (DI Container)          │  │
│  │  - IErrorHandler (Singleton)                          │  │
│  │  - IDbConnectionFactory, IDapperExecutor (Scoped)     │  │
│  │  - 35+ Repositories, 38+ Services (Scoped)            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │    Services/    │  │  Repositories/  │  │  Notifiers  │  │
│  │ OrderingService │  │ SeatRepository  │  │ SignalR     │  │
│  │ PaymentService  │  │ SaleRepository  │  │ Notifier    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Unit of Work (Transaction Coordinator)                  ││
│  │  - Lazy-loaded repositories                             ││
│  │  - BeginTransactionAsync / CommitAsync / RollbackAsync  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │       Data/        │  │      Helper/       │            │
│  │ SqlConnectionFactory│  │  DapperExecutor   │            │
│  │ (Dual-DB Failover) │  │  DapperTool       │            │
│  └────────────────────┘  └────────────────────┘            │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                      Database Layer                          │
├─────────────────────────────────────────────────────────────┤
│   Primary: SQL Server (sitedatabase)                         │
│   Fallback: LocalDB (localdatabase)                          │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Tasks

When the user requests backend help:

1. **New Repository:** Create interface + implementation with proper DI setup
2. **New Service:** Create service wrapping repository with retry + logging + SignalR
3. **New DTO:** Create request/response DTOs in SI360.Domain/DTO
4. **SQL Query:** Write parameterized Dapper queries with NOLOCK for reads
5. **Transaction:** Implement multi-step operations with rollback
6. **SignalR:** Add real-time notifications for data changes

## 📝 Checklist

### ✅ New Repository
- [ ] Interface defined in `IRepository/`
- [ ] Implementation extends `RepositoryBase<T>`
- [ ] Constructor injects `IDbConnectionFactory` and `IDapperExecutor`
- [ ] Uses `ExecuteInTransactionAsync` for multi-step operations
- [ ] Uses `WITH (NOLOCK)` for read-only queries
- [ ] Registered as **Scoped** in `ServiceConfiguration.cs`

### ✅ New Service
- [ ] Interface defined in `IService/`
- [ ] Constructor injects required repositories
- [ ] Constructor injects `AsyncRetryPolicy` and `IErrorHandler`
- [ ] Uses `_retryPolicy.ExecuteAsync()` wrapper
- [ ] try/catch with `_errorHandler.LogErrorAsync()`
- [ ] Injects `IDbChangeNotifier` if broadcasts changes
- [ ] Registered as **Scoped** in `ServiceConfiguration.cs`

### ✅ SignalR Notification
- [ ] Create `DbChangeEvent` with Table, Action, Key
- [ ] Call `_signalRNotifier.NotifyAsync()` after transaction commit
- [ ] Include SaleId, SaleItemId for targeted UI updates
- [ ] Use `Application.Current.Dispatcher.Invoke()` in client handlers

### ✅ Unit of Work Usage
- [ ] Use for multi-repository transactions
- [ ] Call `BeginTransactionAsync()` before operations
- [ ] Call `CommitAsync()` on success
- [ ] Call `RollbackAsync()` on failure (or use `ExecuteInTransactionAsync`)
- [ ] Access repositories via lazy properties (e.g., `_unitOfWork.Seats`)

Always address the user as **Francis**.
