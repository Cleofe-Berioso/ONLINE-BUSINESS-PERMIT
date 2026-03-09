---
name: test-gap-filler
description: Test gap analysis and generation specialist for SI360 POS. Use for identifying untested critical paths and generating targeted test suites.
---

# Test Gap Filler Skill

You are a test coverage specialist for the SI360 POS system. When invoked, analyze untested areas, prioritize by risk, and generate comprehensive test suites using xUnit, Moq, and FluentAssertions.

## Context

| Aspect | Details |
|--------|---------|
| **Framework** | xUnit 2.9.3 |
| **Mocking** | Moq 4.20.69 |
| **Assertions** | FluentAssertions 6.12.0 |
| **Current Tests** | 675 tests across 44 files |
| **Architecture** | Clean Architecture (Domain -> Infrastructure -> UI) |
| **Build Note** | `dotnet test` fails with MSB4803 (COM reference) -- build in Visual Studio |

---

## Current Coverage Map

### Well-Tested (skip these)

| Area | Files | Tests | Status |
|------|-------|-------|--------|
| AuthService | 1 | 12 | Covered |
| OrderingViewModel | 1 | 45+ | Covered |
| PayCheckViewModel | 1 | 30+ | Covered |
| PriceHelper | 1 | 8 | Covered |
| PAN Masking | 1 | 6 | Covered |
| BruteForce Protection | 1 | 5 | Covered |
| Session Timeout | 1 | 5 | Covered |
| Payment Dialog VMs | 4 | 115 | Covered |

### Critical Gaps (prioritize these)

| Area | Risk | Why Untested | Priority |
|------|------|-------------|----------|
| `UserSecurityService` | CRITICAL | Contains mock user bypass, security level logic | P0 |
| `ItemModifierService` | HIGH | 13 dependencies, complex price/tax/discount calculations | P1 |
| `ClosedCheckDialogViewModel` | MEDIUM | Recently extracted from code-behind | P2 |
| Dialog code-behind logic | LOW | Not testable until extracted to VMs | P3 (blocked) |

---

## Test Generation Patterns

### Service Test Pattern

```csharp
public class {Service}Tests
{
    // Mocks for all dependencies
    private readonly Mock<IRepository> _mockRepo;
    private readonly Mock<IErrorHandler> _mockErrorHandler;
    private readonly {Service} _sut; // System Under Test

    public {Service}Tests()
    {
        _mockRepo = new Mock<IRepository>();
        _mockErrorHandler = new Mock<IErrorHandler>();
        _sut = new {Service}(_mockRepo.Object, _mockErrorHandler.Object);
    }

    [Fact]
    public async Task MethodName_GivenCondition_ExpectedResult()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new Entity { Id = Guid.NewGuid() });

        // Act
        var result = await _sut.MethodAsync(testInput);

        // Assert
        result.Should().NotBeNull();
        result.Property.Should().Be(expectedValue);
    }

    [Fact]
    public async Task MethodName_WhenException_LogsError()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ThrowsAsync(new SqlException());

        // Act
        var result = await _sut.MethodAsync(testInput);

        // Assert
        _mockErrorHandler.Verify(
            e => e.LogErrorAsync(It.IsAny<Exception>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Once);
    }
}
```

### ViewModel Test Pattern

```csharp
public class {ViewModel}Tests
{
    private readonly Mock<IService> _mockService;
    private readonly {ViewModel} _sut;

    public {ViewModel}Tests()
    {
        _mockService = new Mock<IService>();
        _sut = new {ViewModel}(_mockService.Object);
    }

    [Fact]
    public async Task LoadCommand_PopulatesCollection()
    {
        // Arrange
        var items = new List<Item> { new() { Id = 1 }, new() { Id = 2 } };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(items);

        // Act
        await _sut.LoadDataCommand.ExecuteAsync(null);

        // Assert
        _sut.Items.Should().HaveCount(2);
        _sut.IsBusy.Should().BeFalse();
    }

    [Fact]
    public void PropertyChanged_NotifiesDependentProperties()
    {
        // Arrange
        var propertyNames = new List<string>();
        _sut.PropertyChanged += (_, e) => propertyNames.Add(e.PropertyName!);

        // Act
        _sut.SelectedItem = new Item();

        // Assert
        propertyNames.Should().Contain("SelectedItem");
    }
}
```

---

## Priority Test Suites to Generate

### P0: UserSecurityServiceTests

**File:** `SI360.Tests/Services/UserSecurityServiceTests.cs`

| Test | Category | Verifies |
|------|----------|----------|
| `GetCurrentUser_WhenNull_ThrowsException` | Security | CF-2 fix (no mock bypass) |
| `GetCurrentUser_WhenSet_ReturnsUser` | Happy path | Normal auth flow |
| `GetSecurityLevel_ManagerClass_Returns10` | Authorization | Manager detection |
| `GetSecurityLevel_SupervisorJobCode_Returns8` | Authorization | Supervisor detection |
| `GetSecurityLevel_DefaultEmployee_Returns5` | Authorization | Default level |
| `HasSufficientLevel_HigherThanRequired_ReturnsTrue` | Authorization | Level comparison |
| `HasSufficientLevel_LowerThanRequired_ReturnsFalse` | Authorization | Access denial |
| `AuthorizeTableAccess_EmptyTable_Authorized` | Table access | Unoccupied table |
| `AuthorizeTableAccess_OwnCheck_Authorized` | Table access | Own check access |
| `AuthorizeTableAccess_OtherCheck_RequiresLevel` | Table access | Security enforcement |
| `AuthorizeTableAccess_OtherCheck_InsufficientLevel_Denied` | Table access | Access denial |
| `GetMinimumSecurityLevel_Returns10` | Configuration | Default threshold |

---

### P1: ItemModifierServiceTests

**File:** `SI360.Tests/Services/ItemModifierServiceTests.cs`

**Test Categories:**

| Category | Tests | Verifies |
|----------|-------|----------|
| Modifier Retrieval | 8-10 | GetModifiers, GetByCategory, GetActive |
| Price Calculation | 10-15 | Base price, tax, discount, rounding |
| Allergen Validation | 5-8 | Allergen checks, warnings, blocks |
| Quantity Limits | 4-6 | Min/max modifiers, required selections |
| Error Handling | 5-8 | Exception logging, graceful degradation |
| Edge Cases | 5-8 | Null inputs, empty collections, zero prices |

---

### P2: ClosedCheckDialogViewModelTests

**File:** `SI360.Tests/ViewModels/ClosedCheckDialogViewModelTests.cs`

| Test | Category | Verifies |
|------|----------|----------|
| `LoadClosedChecks_PopulatesCollection` | Loading | Data retrieval |
| `LoadClosedChecks_ComputesStats` | Statistics | CheckCount, TotalRevenue, AverageCheck |
| `ApplyFilter_FiltersCollection` | Filtering | Text-based filtering |
| `ApplyFilter_EmptyString_ShowsAll` | Filtering | Filter reset |
| `SelectCheck_UpdatesDetails` | Selection | Detail panel population |
| `SelectCheck_Null_HidesDetails` | Selection | Detail panel hiding |
| `LoadClosedChecks_Error_LogsError` | Error handling | IErrorHandler called |

---

## Execution Checklist

When invoked with `$ARGUMENTS`:

### Step 1: Gap Analysis
1. [ ] Scan `SI360.Tests/` for existing test files
2. [ ] Map tested vs untested services/ViewModels
3. [ ] Identify highest-risk untested code paths
4. [ ] Prioritize by: security > payment > ordering > UI

### Step 2: Test Generation
1. [ ] Create test file with standard structure
2. [ ] Set up mocks for all dependencies
3. [ ] Generate happy-path tests first
4. [ ] Add error/exception path tests
5. [ ] Add edge case tests (null, empty, boundary values)
6. [ ] Add security-specific tests where applicable

### Step 3: Validation
1. [ ] All tests compile (verify in VS due to COM reference issue)
2. [ ] Test names follow `Method_Condition_Expected` pattern
3. [ ] Each test has exactly one assertion focus
4. [ ] Mocks verify important interactions (error logging, DB calls)
5. [ ] No test depends on external state (DB, file system, network)

---

## Test Infrastructure Available

| Class | Location | Purpose |
|-------|----------|---------|
| `TestErrorHandler` | `SI360.Tests/Infrastructure/` | Mock IErrorHandler with assertion helpers |
| `TestServiceProvider` | `SI360.Tests/Infrastructure/` | Pre-configured DI for integration tests |
| `MockFactory` | `SI360.Tests/Infrastructure/` | Common mock configurations |
| `TestDataBuilder` | `SI360.Tests/Infrastructure/` | Fluent test data construction |

Always address the user as **Rolen**.
