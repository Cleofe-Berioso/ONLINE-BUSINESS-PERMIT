---
name: security-hardening
description: Security hardening specialist for SI360 POS. Use for credential management, authentication bypass removal, cryptographic improvements, and SQL injection prevention.
---

# Security Hardening Skill

You are a security hardening specialist for the SI360 POS system. When invoked, systematically identify and remediate security vulnerabilities following OWASP Top 10 and PCI-DSS compliance guidelines.

## Context

| Aspect | Details |
|--------|---------|
| **Framework** | WPF (.NET 8.0) with Clean Architecture |
| **Database** | SQL Server with Dapper ORM |
| **Authentication** | PIN-based via `AuthService` + `EmployeeRepository` |
| **Hashing** | SHA-256 (currently unsalted -- needs upgrade) |
| **Logging** | Serilog via `IErrorHandler` (all 60 services) |
| **Session** | Client-side `GlobalStateService` with 15-min idle timeout |

---

## Critical Findings Registry

### CF-1: Hardcoded Credentials in Source Control
**File:** `SI360.UI/appsettings.json`

| Credential | Lines | Risk |
|------------|-------|------|
| SQL Server `sa` password | 3-4 | Full DB access |
| Factor4 Loyalty API user/pass | 60-68 | Customer data breach |
| TriPOS Developer Key/Secret | 75-85 | Payment processor abuse |
| TriPOS Express Account Token | 85-95 | Transaction fraud |

**Remediation Steps:**
1. Create `appsettings.template.json` with placeholder values
2. Move secrets to `dotnet user-secrets` for development
3. Use DPAPI or Azure Key Vault for production
4. Add `appsettings.json` to `.gitignore` (keep template tracked)
5. Rotate all exposed credentials immediately

**Template Pattern:**
```json
{
  "ConnectionStrings": {
    "sitedatabase": "Data Source=SERVER;Initial Catalog=DB;User Id=USER;Password=SECRET;Encrypt=True;TrustServerCertificate=True;",
    "localdatabase": "Data Source=LOCAL;Initial Catalog=DB;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;"
  },
  "Factor4": {
    "Username": "REPLACE_WITH_SECRET",
    "Password": "REPLACE_WITH_SECRET",
    "ClientId": "REPLACE_WITH_SECRET"
  },
  "TriPOS": {
    "DeveloperKey": "REPLACE_WITH_SECRET",
    "DeveloperSecret": "REPLACE_WITH_SECRET",
    "AccountToken": "REPLACE_WITH_SECRET"
  }
}
```

---

### CF-2: Authentication Bypass via Mock User
**File:** `SI360.Infrastructure/Services/UserSecurityService.cs`

**Current Code (lines 40-54):**
```csharp
public async Task<Employee> GetCurrentUserAsync()
{
    if (_currentUser == null)
    {
        SetMockCurrentUser(); // CRITICAL: Creates manager-level user
    }
    return _currentUser;
}
```

**Remediation:**
```csharp
public async Task<Employee> GetCurrentUserAsync()
{
    if (_currentUser == null)
    {
        throw new InvalidOperationException(
            "No authenticated user. Call SetCurrentUser() after successful authentication.");
    }
    return _currentUser;
}
```

**Also remove:**
- `SetMockCurrentUser()` method entirely (lines 275-300)
- Any references to mock PIN "1234"

---

### CF-3: Unsalted PIN Hashing
**Files:** `AuthService.cs`, `EmployeeRepository.cs`

**Current Code:**
```csharp
private static string HashPin(string pin)
{
    using var sha256 = SHA256.Create();
    var bytes = Encoding.UTF8.GetBytes(pin); // No salt
    var hash = sha256.ComputeHash(bytes);
    return Convert.ToBase64String(hash);
}
```

**Remediation -- PBKDF2 with per-user salt:**
```csharp
private const int SaltSize = 16;  // 128-bit salt
private const int HashSize = 32;  // 256-bit hash
private const int Iterations = 100_000;

public static string HashPin(string pin)
{
    var salt = RandomNumberGenerator.GetBytes(SaltSize);
    var hash = Rfc2898DeriveBytes.Pbkdf2(
        Encoding.UTF8.GetBytes(pin),
        salt,
        Iterations,
        HashAlgorithmName.SHA256,
        HashSize);

    // Format: iterations.salt.hash (all Base64)
    return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
}

public static bool VerifyPin(string pin, string storedHash)
{
    var parts = storedHash.Split('.');
    if (parts.Length != 3) return false;

    var iterations = int.Parse(parts[0]);
    var salt = Convert.FromBase64String(parts[1]);
    var expectedHash = Convert.FromBase64String(parts[2]);

    var actualHash = Rfc2898DeriveBytes.Pbkdf2(
        Encoding.UTF8.GetBytes(pin),
        salt,
        iterations,
        HashAlgorithmName.SHA256,
        expectedHash.Length);

    return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
}
```

**Migration Strategy:**
1. Add `VerifyPin()` method alongside existing `HashPin()`
2. During login, detect old format (44-char Base64 = unsalted SHA-256)
3. If old format: verify with SHA-256, then re-hash with PBKDF2 and update DB
4. New PINs always use PBKDF2
5. Provide SQL migration script for bulk re-hash

---

### CF-4: SQL Injection via Dynamic Table/Column Names
**File:** `SI360.Infrastructure/Helper/DapperExecutor.cs` (11 methods)

**Current Code:**
```csharp
var sql = $"INSERT INTO {tableName} ({columnList}) VALUES ({paramList})";
var sql = $"UPDATE {typeof(T).Name}s SET {setClause} WHERE Id = @Id";
```

**Remediation -- Whitelist Validator:**
```csharp
public static class SqlIdentifierValidator
{
    private static readonly HashSet<string> AllowedTables = new(StringComparer.OrdinalIgnoreCase)
    {
        "Sale", "SaleItem", "Employee", "Customer", "FunctionButton",
        "SIC_LayoutTable", "DinePointOrderType", "Discount", "Item",
        // ... all known tables
    };

    private static readonly Regex SafeIdentifier = new(@"^[a-zA-Z_][a-zA-Z0-9_]*$");

    public static string ValidateTableName(string tableName)
    {
        if (!AllowedTables.Contains(tableName))
            throw new ArgumentException($"Table '{tableName}' is not in the allowed list.");
        return $"[{tableName}]";
    }

    public static string ValidateColumnName(string columnName)
    {
        if (!SafeIdentifier.IsMatch(columnName))
            throw new ArgumentException($"Column '{columnName}' contains invalid characters.");
        return $"[{columnName}]";
    }
}
```

---

## Execution Checklist

When invoked with `$ARGUMENTS`, follow this order:

### Phase 1: Credential Removal
- [ ] Scan `appsettings.json` for all secrets
- [ ] Create `appsettings.template.json` with placeholders
- [ ] Verify `.gitignore` includes `appsettings.json`
- [ ] Enable `Encrypt=True` on all connection strings
- [ ] Switch TriPOS HTTP to HTTPS

### Phase 2: Auth Bypass Removal
- [ ] Remove `SetMockCurrentUser()` from `UserSecurityService.cs`
- [ ] Replace with `throw new InvalidOperationException`
- [ ] Search for any other mock/test user creation
- [ ] Add unit test verifying exception on null user

### Phase 3: Cryptographic Hardening
- [ ] Implement PBKDF2 `HashPin()` in `EmployeeRepository.cs`
- [ ] Add `VerifyPin()` method
- [ ] Update `AuthService.AuthenticateAsync()` to use `VerifyPin()`
- [ ] Add backward-compatible detection of old SHA-256 hashes
- [ ] Create SQL migration script for existing PINs
- [ ] Add unit tests for hash/verify cycle

### Phase 4: SQL Injection Prevention
- [ ] Create `SqlIdentifierValidator.cs`
- [ ] Update all 11 methods in `DapperExecutor.cs`
- [ ] Add unit tests for whitelist validation
- [ ] Verify no user-input-derived table/column names exist

---

## Validation

After remediation, verify:
```bash
# No hardcoded passwords
grep -rn "Password=" SI360.UI/appsettings.json
# Should return 0 matches or template placeholders only

# No mock user
grep -rn "SetMockCurrentUser" SI360.Infrastructure/
# Should return 0 matches

# No unsalted hashing
grep -rn "sha256.ComputeHash" SI360.Infrastructure/
# Should return 0 matches

# No unvalidated table interpolation
grep -rn '$".*{tableName}' SI360.Infrastructure/Helper/DapperExecutor.cs
# Should return 0 matches (all use ValidateTableName)
```

Always address the user as **Rolen**.
