# Comprehensive Codebase Assessment

Perform a comprehensive codebase assessment with dual grading (Letter grade F → A+ and /10 per category) for all 6 categories below. Use **quantitative, evidence-based scoring** — count violations, not subjective impressions.

---

## Instructions

1. **Search exhaustively** — use `grep`/`glob` across ALL files in the category's scope, not samples.
2. **Count violations** — report exact counts, not estimates.
3. **Cite evidence** — every finding must include `file:line` reference.
4. **Score by formula** — use the rubric below, not subjective judgment.
5. **Run all 6 categories in parallel** using Task agents for speed.
6. **No double-counting** — each issue counts in ONE category only (the most relevant one).

---

## Scoring Rubric (apply consistently)

| Grade | Score | Criteria |
|-------|-------|----------|
| A+ | 10/10 | 0 critical, 0 high, ≤2 medium issues |
| A | 9/10 | 0 critical, ≤2 high, ≤5 medium issues |
| A- | 8.5/10 | 0 critical, ≤4 high, ≤8 medium issues |
| B+ | 8/10 | 0 critical, ≤6 high, ≤12 medium issues |
| B | 7.5/10 | ≤1 critical, ≤8 high, any medium |
| B- | 7/10 | ≤2 critical, ≤10 high, any medium |
| C+ | 6.5/10 | ≤3 critical, any high/medium |
| C | 6/10 | ≤5 critical, any high/medium |
| F | <5/10 | >5 critical issues |

**Severity definitions:**
- **CRITICAL**: Security vulnerability, data loss risk, crash in production, or memory leak that grows unbounded over time
- **HIGH**: Violates project CLAUDE.md mandate, significant quality/performance gap, or untested critical-path code
- **MEDIUM**: Deviation from best practice, minor inconsistency, or non-critical gap
- **LOW**: Style preference, polish item (do NOT count toward grade)

---

## Category 1: SECURITY

**Scope:** `SI360.Infrastructure/`, `SI360.UI/`, `SI360.Domain/` (exclude `SI360.Tests/`)

**Exact checks (search ALL files in scope):**

| Check | Search Pattern | Severity if Found |
|-------|---------------|-------------------|
| SQL string concatenation | `$"SELECT`, `$"UPDATE`, `$"INSERT`, `$"DELETE`, `"SELECT " +`, `"UPDATE " +` in `.cs` files. **Important:** If all instances use `SqlSafetyValidator` for identifiers and Dapper `@params` for values, downgrade to MEDIUM (no actual injection risk). Only flag as CRITICAL if user input flows directly into SQL. | CRITICAL or MEDIUM |
| Hardcoded secrets | `password=`, `pwd=`, `apikey`, `secret=`, `token=` in `.cs` string literals (exclude appsettings, tests, comments, parameter names) | CRITICAL |
| Empty catch blocks | `catch` followed by `{` with only `return` or empty body, no logging. Count in Security only if it swallows security-relevant errors; otherwise count in Code Quality. | HIGH |
| Exception message in UI | `ex.Message` inside `MessageBox.Show` or `PosMessageDialog.Show` (directly displayed to user). Count as 1 MEDIUM per distinct dialog/view file, not per occurrence. `ErrorMessage = $"...{ex.Message}"` bound to UI is also MEDIUM but count as 1 per ViewModel file. | MEDIUM (1 per file) |
| SELECT * usage | `SELECT *` in `.cs` files (exclude tests). Count as 1 MEDIUM per file containing it, not per occurrence. | MEDIUM (1 per file) |
| Async void (non-event-handler) | `async void` methods that are NOT event handlers (not `_Loaded`, `_Click`, `_Tick`, `_Changed`, `_SelectionChanged`, `_Closed`, `_Unloaded`, `_Closing`). Also exclude DispatcherTimer.Tick and WeakReferenceMessenger handlers. | HIGH |

---

## Category 2: MEMORY MANAGEMENT

**Scope:** `SI360.UI/ViewModels/`, `SI360.UI/Views/`, `SI360.UI/Services/`, `SI360.UI/Behaviors/`, `SI360.Infrastructure/Services/`

**Exact checks:**

| Check | What to Search | Severity if Found |
|-------|---------------|-------------------|
| Missing IDisposable | ViewModels with `CancellationTokenSource`, `DispatcherTimer`, `System.Timers.Timer`, or `PollingViewModel` fields that do NOT implement `IDisposable` | CRITICAL |
| Undisposed CancellationTokenSource | CTS fields (`CancellationTokenSource`) not disposed in Dispose() method. Also check for `SemaphoreSlim` fields not disposed. | HIGH |
| Event subscription without unsubscription | In `.xaml.cs` files: `+=` event subscriptions without corresponding `-=` in `OnClosed`/`Dispose`/`Unloaded`. **Exclude:** subscriptions to own controls (cleared when window closes) | HIGH |
| Inline lambda event subscriptions | `+= (` or `+= async (` patterns in `.xaml.cs` that cannot be unsubscribed. **Exclude:** `Loaded += (s, e) => Focus()` (harmless, self-referencing). Only count lambdas that reference ViewModel events. | HIGH |
| Timer not stopped/disposed | `DispatcherTimer` or `System.Timers.Timer` created but `Stop()` not called in any cleanup path (Dispose/OnClosed/Unloaded) | HIGH |
| PollingViewModel not cleaned | `PollingViewModel<` fields without `StopPolling()` in Dispose/cleanup | MEDIUM |
| Unbounded collection growth | `ObservableCollection` or `List` that has `.Add()` but no `.Clear()` or `.Remove()` in any code path | MEDIUM |

---

## Category 3: PERFORMANCE

**Scope:** `SI360.Infrastructure/`, `SI360.UI/ViewModels/`

**Exact checks:**

| Check | What to Search | Severity if Found |
|-------|---------------|-------------------|
| Blocking async calls | `.Result`, `.Wait()`, `.GetAwaiter().GetResult()` in non-test `.cs` files | CRITICAL |
| N+1 query patterns | Loops containing `await` database calls (foreach/for with await inside repository/service methods). Count as 1 HIGH per distinct method, not per loop iteration. | HIGH (1 per method) |
| Missing NOLOCK on reads | `SELECT` queries without `WITH (NOLOCK)` in repository files. Count as 1 HIGH per file, not per query. | HIGH (1 per file) |
| Missing caching | Services that call repository methods for static/semi-static data (rooms, menu items, job codes, navigation buttons) without using `ICacheService`. Count as 1 MEDIUM per service. | MEDIUM (1 per service) |
| Reflection per call | `GetProperties()`, `GetType().GetProperty()` called inside methods without caching the result. Count as 1 MEDIUM per file. | MEDIUM (1 per file) |
| Missing pagination | Repository queries returning lists without `TOP`, `OFFSET/FETCH`, or `ROW_NUMBER` for potentially large result sets | MEDIUM |
| Fire-and-forget tasks | `_ = Task.Run(` or `_ = SomeMethodAsync()` without error handling | LOW |

---

## Category 4: TESTS

**Scope:** `SI360.Tests/`, `SI360.Infrastructure/Services/`, `SI360.Infrastructure/Repositories/`, `SI360.UI/ViewModels/`

**Exact checks:**

| Check | How to Measure | Severity if Found |
|-------|---------------|-------------------|
| Untested critical services | List ALL `.cs` files in `Infrastructure/Services/`. Check if corresponding test file exists in `Tests/Services/`. **Only these are CRITICAL:** AesEncryptionService, Pbkdf2PasswordHasher, BruteForceProtectionService, PaymentProcessorRouter, StoredProcedureService (security/payment/auth). All other untested services = 1 HIGH total (not per service). | CRITICAL per security/payment service; 1 HIGH for rest |
| Service coverage % | Calculate: tested/total × 100. Report the percentage. | <70% = 1 CRITICAL; 70-85% = 1 HIGH; >85% = no issue |
| Repository coverage % | Calculate: tested/total × 100. Report the percentage. | <40% = 1 HIGH; 40-60% = 1 MEDIUM; >60% = no issue |
| ViewModel coverage % | Calculate: tested/total × 100. Report the percentage. | <50% = 1 MEDIUM; >50% = no issue |
| Weak assertions | Count `.Should().NotBeNull()` as sole assertion per test method | MEDIUM per 25 occurrences (round down) |
| Flaky test patterns | `Task.Delay`, `Thread.Sleep`, `.Wait()` in test files | MEDIUM per 15 occurrences (round down) |
| Total test count | Count `[Fact]` and `[Theory]` attributes | INFO (not graded) |

---

## Category 5: CODE QUALITY

**Scope:** `SI360.Infrastructure/`, `SI360.UI/`, `SI360.Domain/` (exclude `SI360.Tests/`)

**Exact checks:**

| Check | What to Search | Severity if Found |
|-------|---------------|-------------------|
| Layer violations | Check `.csproj` ProjectReference entries: Domain must NOT reference Infrastructure or UI; Infrastructure must NOT reference UI | CRITICAL |
| Constructor >6 params | Find all constructors with >6 parameters. Count as 1 HIGH per distinct class (not per constructor overload). | HIGH (1 per class) |
| God classes >500 lines | Count lines per `.cs` file. **Exclude:** test files, partial files that belong to the same logical class (e.g., OrderingViewModel.Manager.cs, OrderingViewModel.Operations.cs count as 1 class "OrderingViewModel"), generated code. Count DISTINCT classes >500 lines. | See scoring below |
| Empty catch blocks | `catch` blocks with no logging (`_errorHandler`, `Debug.WriteLine`, `LogError`, `LogWarning`, `LogInfo`, `throw`) and no meaningful handling | HIGH |
| Unused exception variable | `catch (Exception ex)` where `ex` is never referenced in the catch body | MEDIUM per 5 occurrences (round down) |
| Naming violations | Public properties with camelCase in non-third-party-DTO files. Count as 1 MEDIUM per file. Third-party API DTOs (e.g., TriPOS SaleResponse matching external API) are exempt. | MEDIUM (1 per file, exempt 3rd-party DTOs) |
| TODO/HACK/FIXME | Count all TODO, HACK, FIXME comments in non-test code | MEDIUM per 5 occurrences (round down) |

**God class scoring (DISTINCT classes only):**
- Partial files of same class = 1 class (e.g., OrderingViewModel.*.cs = 1 "OrderingViewModel")
- 0 classes >500 lines = no penalty
- 1-5 classes = 1 HIGH each
- 6-10 classes = 1 CRITICAL + remaining HIGH
- 11+ classes = 2 CRITICAL + remaining HIGH

---

## Category 6: XAML & UI STANDARDS

**Scope:** `SI360.UI/Views/`, `SI360.UI/Styles/`, `SI360.UI/Controls/`

**Style definition files to EXCLUDE from violation checks** (these are resource definition files, allowed to have hex values):
SharedStyles.xaml, Foundations.xaml, CoreStyles.xaml, DialogStyles.xaml, CalendarStyles.xaml, ButtonStyles.xaml, VirtualKeyboardStyles.xaml, LayoutStyles.xaml, ViewStyles.xaml

**Exact checks:**

| Check | What to Search | Severity if Found |
|-------|---------------|-------------------|
| Inline hex colors in views | `Color="#`, `Background="#`, `Foreground="#`, `BorderBrush="#`, `Fill="#"`, `Stroke="#"` in `.xaml` VIEW files only (not style definition files listed above) | HIGH (1 per file) |
| Inline FontSize in views | `FontSize="[0-9]` in `.xaml` VIEW files only (not style definition files) | HIGH (1 per file) |
| Missing AutomationProperties | Interactive controls (`<Button `, `<TextBox `, `<ComboBox `, `<CheckBox `, `<ToggleButton `, `<DataGrid `) without `AutomationProperties.Name` in view files. Count 1 MEDIUM per file missing them. | MEDIUM (1 per file) |
| Missing KeyboardNavigation | Dialog/view root grids without `KeyboardNavigation.TabNavigation="Cycle"`. Exclude shell/container windows that host child views with KeyboardNavigation. | MEDIUM (1 per file) |
| Button height < 64 | `Height="[0-9]` on Button elements where value < 64 in view files | HIGH (accessibility) |
| Button height > 64 | `Height="[0-9]` on Button elements where value > 64 in view files | MEDIUM (inconsistency) |
| Font size below 16px | Any `FontSize` resource or value resolving to <16 in view files | HIGH |
| Missing SharedStyles import | View files without `SharedStyles.xaml` in MergedDictionaries | HIGH |
| Broken Unicode | `\uFFFD` or `�` replacement characters in .xaml files | CRITICAL |

---

## Output Format

Present results in this exact format:

```
## ASSESSMENT RESULTS

### 1. SECURITY — [GRADE] ([SCORE]/10)
| # | Severity | File:Line | Issue |
|---|----------|-----------|-------|
(list all findings — group by file, not by individual occurrence)

**Violation counts:** X critical, Y high, Z medium

### 2. MEMORY — [GRADE] ([SCORE]/10)
(same table format)

### 3. PERFORMANCE — [GRADE] ([SCORE]/10)
(same table format)

### 4. TESTS — [GRADE] ([SCORE]/10)
(same table format, include coverage percentages)

### 5. CODE QUALITY — [GRADE] ([SCORE]/10)
(same table format, list distinct god classes not individual files)

### 6. XAML — [GRADE] ([SCORE]/10)
(same table format)

---

## COMPOSITE SCORE
Formula: (Security + Memory + Performance + Tests + CodeQuality + XAML) / 6
**Composite: [GRADE] ([SCORE]/10)**

## PRIORITY REMEDIATION
### Tier 1 — Critical + High (must fix)
| # | Fix | Category | Est. |
|---|-----|----------|------|
(table of fixes with time estimates)

### Tier 2 — Medium (should fix)
| # | Fix | Category | Est. |
|---|-----|----------|------|
(table of fixes with time estimates)
```
