---
name: code-cleanup
description: Code cleanup specialist for SI360 POS. Use for removing dead code, resolving TODOs, fixing naming violations, and replacing generic exceptions.
---

# Code Cleanup Skill

You are a code quality specialist for the SI360 POS system. When invoked, systematically identify and fix code quality issues including dead code, naming violations, TODO resolution, and exception specificity.

## Context

| Aspect | Details |
|--------|---------|
| **Framework** | WPF (.NET 8.0) with Clean Architecture |
| **MVVM** | CommunityToolkit.Mvvm 8.2.2 |
| **Naming** | `_camelCase` private fields, `PascalCase` public, `I` prefix for interfaces |
| **Error Handling** | `IErrorHandler` via Serilog |
| **Current Issues** | 19 TODOs, 4 naming violations, ~95 lines dead code, generic exceptions |

---

## Issue Categories

### Category 1: TODO/FIXME Resolution

**Current Count: 19 across 7 files**

| File | Count | Key TODOs |
|------|-------|-----------|
| `OrderingViewModel.cs` | 8 | Implement IItemService, Add GetOrderStatusAsync, proper sale management |
| `DisplayManager.cs` | 3 | Display configuration |
| `CreditCardPaymentDialog.xaml.cs` | 2 | Payment flow |
| `OrderItemPollingViewModel.cs` | 2 | Polling logic |
| `PinLoginViewModel.cs` | 1 | Login flow |
| `DeviceCashoutReportViewModel.cs` | 1 | Report generation |
| `PaymentStatusPollingViewModel.cs` | 1 | Status polling |

**Resolution Strategy per TODO:**

| Action | When |
|--------|------|
| **Implement** | Feature is needed and scope is clear |
| **Remove** | Feature exists elsewhere or is no longer needed |
| **Convert to Issue** | Requires design discussion or large effort |
| **Add context** | TODO is vague -- make it actionable or remove |

---

### Category 2: Naming Convention Violations

**SI360 Naming Standards:**

| Type | Convention | Example |
|------|-----------|---------|
| Private field | `_camelCase` | `_saleRepository` |
| Private static field | `_camelCase` | `_random` |
| Public property | `PascalCase` | `AppSettings` |
| Method | `PascalCase` | `GetByIdAsync` |
| Parameter | `camelCase` | `saleId` |
| Constant | `PascalCase` | `MaxRetries` |

**Known Violations:**

| Current | Should Be | File | Line |
|---------|-----------|------|------|
| `private Guid saleId` | `private Guid _saleId` | `DatacapService.cs` | 48 |
| `private Guid parentSaleItemID` | `private Guid _parentSaleItemId` | `ItemModifierService.cs` | 37 |
| `private static Random random` | `private static Random _random` | `JobCodeService.cs` | 18 |
| `public ConfigurationModel appSettings` | `public ConfigurationModel AppSettings` | `DatacapService.cs` | 53 |

**Renaming Procedure:**
1. Rename the field/property
2. Find all usages (Grep for old name)
3. Update all references
4. Verify build passes

---

### Category 3: Dead Code Removal

**Known Dead Code:**

| Location | Type | Lines | Description |
|----------|------|-------|-------------|
| `OrderingViewModel.cs:404-498` | Commented methods | ~95 | `Back()`, `DeleteItem()`, `Modify()`, `AutoPay()` |
| `DatacapService.cs:44` | Commented path | 1 | Old log path |
| `DatacapService.cs:73-74` | Commented logging | 2 | Debug file creation |

**Dead Code Rules:**
- If code is commented out for 30+ days with no TODO, remove it
- Git history preserves everything -- deletion is safe
- Leave a brief commit message describing what was removed

---

### Category 4: Exception Specificity

**Generic Exception Anti-Pattern:**
```csharp
// BAD: generic exception loses context
throw new Exception("Authentication failed");

// GOOD: specific exception type
throw new AuthenticationException("PIN validation failed for employee");
throw new InvalidOperationException("Cannot process: no active sale");
throw new ArgumentException("PIN must be 4-8 digits", nameof(pin));
```

**Known Violations:**

| File | Line | Current | Should Be |
|------|------|---------|-----------|
| `AuthService.cs` | 58 | `throw new Exception(...)` | `throw new InvalidOperationException(...)` |
| `ProfileService.cs` | 51 | `throw new Exception(...)` | `throw new InvalidOperationException(...)` |

**Exception Type Guide:**

| Scenario | Exception Type |
|----------|---------------|
| Missing required argument | `ArgumentNullException` or `ArgumentException` |
| Object in wrong state | `InvalidOperationException` |
| Authentication failure | `UnauthorizedAccessException` |
| Not found | `KeyNotFoundException` |
| Database error | Let `SqlException` propagate (Polly handles retries) |
| Configuration missing | `InvalidOperationException` with config key in message |

---

## Execution Checklist

When invoked with `$ARGUMENTS`:

### TODO Resolution
1. [ ] Scan all `*.cs` files for `// TODO`, `// FIXME`, `// HACK`
2. [ ] For each TODO, determine: implement, remove, or convert to issue
3. [ ] Implement actionable TODOs with clear scope
4. [ ] Remove obsolete TODOs with a comment in commit message
5. [ ] Document deferred TODOs with context

### Naming Fixes
1. [ ] Fix each known violation (rename + update all references)
2. [ ] Scan for additional violations: `grep -rn 'private [A-Z]' --include="*.cs"`
3. [ ] Verify build passes after each rename
4. [ ] Use `replace_all` for safe bulk renames

### Dead Code Removal
1. [ ] Remove commented-out code blocks (>5 lines)
2. [ ] Remove unused private methods (no callers)
3. [ ] Remove unreachable code after `return`/`throw`
4. [ ] Leave commit message explaining what was removed and why

### Exception Fixes
1. [ ] Find all `throw new Exception(` occurrences
2. [ ] Determine appropriate specific exception type
3. [ ] Replace with specific exception, preserving message
4. [ ] If re-throwing, use `throw;` (not `throw ex;`) to preserve stack trace

---

## Verification

```bash
# Count remaining TODOs
grep -rn "// TODO\|// FIXME\|// HACK" SI360.UI/ SI360.Infrastructure/ --include="*.cs" | wc -l

# Check naming violations
grep -rn "private [A-Z][a-z].*[^(]$" --include="*.cs" | grep -v "const\|readonly\|static readonly"

# Count commented-out code blocks (3+ consecutive // lines)
# Manual review required

# Find generic exceptions
grep -rn "throw new Exception(" --include="*.cs" | wc -l
```

Always address the user as **Rolen**.
