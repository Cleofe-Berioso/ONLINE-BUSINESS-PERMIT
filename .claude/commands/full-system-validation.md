---
name: full-system-validation
description: Comprehensive system validation for SI360 POS. Validates all functions, buttons, dialogs, bindings, services, and workflows to ensure everything works correctly.
---

# Full System Validation Skill

You are a comprehensive validation specialist for the SI360 POS system. When invoked, perform a multi-phase validation across the entire codebase to verify all functions, buttons, and dialogs are fully working.

## Validation Phases Overview

This skill orchestrates validation across **6 phases**, combining techniques from multiple specialized skills:

| Phase | Focus Area | Skills Combined |
|-------|------------|-----------------|
| 1 | XAML-ViewModel Binding Validation | workflow-verificator, frontend-design |
| 2 | Button & Command Verification | workflow-verificator, frontend-design |
| 3 | Dialog Functionality Check | frontend-design, qa-testing |
| 4 | Service Implementation Validation | workflow-verificator, backend-service |
| 5 | Workflow Compliance Verification | workflow-verificator, workflow-definitions |
| 6 | Integration & Completeness Check | qa-testing, unit-test-generator |

---

## Status Icons Reference

| Icon | Meaning | Usage |
|------|---------|-------|
| ✅ | PASS | Validation successful |
| ❌ | FAIL | Critical issue, must fix |
| ⚠️ | WARN | Review recommended |
| 🚧 | TODO | Incomplete implementation |
| ⛔ | NOTIMPL | NotImplementedException found |
| 🔍 | INFO | Informational note |
| 🔗 | BINDING | Binding validation |
| 🕹️ | COMMAND | Command validation |
| 💬 | DIALOG | Dialog validation |
| ⚙️ | SERVICE | Service validation |
| 📋 | WORKFLOW | Workflow compliance |
| 🧪 | TEST | Test coverage |

---

## Phase 1: XAML-ViewModel Binding Validation

### 1.1 Extract All Views and ViewModels

**Scan Locations:**
- Views: `SI360.UI/Views/*.xaml`
- ViewModels: `SI360.UI/ViewModels/*.cs`

### 1.2 Validate Property Bindings

For each `{Binding PropertyName}` in XAML:
- Check ViewModel has `[ObservableProperty] private Type _propertyName;`
- Check public property exists (auto-generated or manual)
- Verify property type compatibility with XAML usage

### 1.3 Validate Command Bindings

For each `Command="{Binding CommandName}"` in XAML:
- Check ViewModel has `[RelayCommand] private void/Task MethodName()`
- Verify CommandParameter compatibility if used
- Check CanExecute method exists if bound to IsEnabled

### 1.4 Report Format

```
🔗 BINDING VALIDATION PHASE 1
============================================================
📁 File: OrderingView.xaml -> OrderingViewModel.cs
  ✅ Property 'SelectedSaleId' found
  ✅ Property 'IsBusy' found
  ✅ Command 'SaveCommand' found (SaveAsync method)
  ❌ Property 'CustomerBalance' NOT FOUND
  ❌ Command 'RefreshCommand' NOT FOUND
  ⚠️ RelativeSource binding at line 145 requires manual review

Summary: 45/50 bindings valid, 3 failures, 2 warnings
```

---

## Phase 2: Button & Command Verification

### 2.1 Extract All Buttons

Scan all XAML files for:
- `<Button>` elements
- Button `Command` bindings
- Button `Click` event handlers
- Button `IsEnabled` bindings

### 2.2 Verify Command Implementations

For each button with a command:
- Check command method exists in ViewModel
- Check method is not `throw new NotImplementedException()`
- Check async commands have proper try-catch
- Verify error handling follows `IErrorHandler` pattern

### 2.3 Verify Click Handlers

For each button with Click event:
- Check code-behind has the handler method
- Check handler calls appropriate ViewModel command
- Verify DialogResult handling for dialogs

### 2.4 Button Functionality Matrix

| View | Button | Type | Binding/Handler | Status |
|------|--------|------|-----------------|--------|
| OrderingView | Save | Command | SaveCommand | ✅ |
| PayCheckView | Cancel | Click | CancelButton_Click | ✅ |
| ... | ... | ... | ... | ... |

### 2.5 Report Format

```
🕹️ BUTTON VALIDATION PHASE 2
============================================================
📁 File: PayCheckView.xaml
  ✅ Button 'CONFIRM' -> ConfirmCommand implemented
  ✅ Button 'CANCEL' -> CancelButton_Click handler exists
  ❌ Button 'VOID' -> VoidCommand throws NotImplementedException
  ⚠️ Button 'PRINT' -> PrintCommand missing error handling

Summary: 120/125 buttons functional, 3 failures, 2 warnings
```

---

## Phase 3: Dialog Functionality Check

### 3.1 Extract All Dialogs

Scan for dialog patterns:
- Files ending in `*Dialog.xaml`
- Windows with `WindowStartupLocation="CenterOwner"`
- Windows with `ResizeMode="NoResize"`

### 3.2 Validate Dialog Structure

For each dialog, verify:
- [ ] Proper SharedStyles.xaml import
- [ ] Window properties match standards (WindowStyle, AllowsTransparency)
- [ ] Header follows User Function pattern (#8034495E)
- [ ] CANCEL button with ExitButtonStyle
- [ ] Primary action button with PrimaryButtonStyle
- [ ] Button height is 64px
- [ ] DialogResult handling in code-behind

### 3.3 Validate Dialog ViewModel

- [ ] ViewModel registered in DI container
- [ ] All commands implemented (not NotImplementedException)
- [ ] Proper INotifyPropertyChanged implementation
- [ ] Error handling with IErrorHandler

### 3.4 Validate Dialog Opening/Closing

- [ ] ShowDialog() called with proper owner
- [ ] DialogResult set correctly on confirm/cancel
- [ ] Window closes properly
- [ ] No memory leaks (event handlers unsubscribed)

### 3.5 Dialog Validation Matrix

| Dialog | Header | Buttons | ViewModel | Open/Close | Status |
|--------|--------|---------|-----------|------------|--------|
| NameCheckDialog | ✅ | ✅ | ✅ | ✅ | ✅ |
| QuantityInputDialog | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| ChargeTipDialog | ✅ | ❌ | ✅ | ✅ | ❌ |

### 3.6 Report Format

```
💬 DIALOG VALIDATION PHASE 3
============================================================
📁 File: NameCheckDialog.xaml
  ✅ SharedStyles.xaml imported
  ✅ User Function header (#8034495E)
  ✅ CANCEL button with ExitButtonStyle
  ✅ SAVE button with PrimaryButtonStyle (64px height)
  ✅ DialogResult handling in code-behind
  ✅ ViewModel registered (NameCheckDialogViewModel)
  ✅ All commands implemented

📁 File: ChargeTipDialog.xaml
  ✅ SharedStyles.xaml imported
  ✅ User Function header
  ❌ Button height is 48px (should be 64px)
  ⚠️ Missing IsCancel="True" on Cancel button

Summary: 28/32 dialogs compliant, 2 failures, 2 warnings
```

---

## Phase 4: Service Implementation Validation

### 4.1 Extract Service Interfaces

Scan `SI360.Infrastructure/IService/*.cs` for:
- All interface methods
- Method signatures (parameters, return types)
- Async patterns (Task<T>)

### 4.2 Validate Service Implementations

For each interface, verify implementation in `SI360.Infrastructure/Services/*.cs`:
- [ ] All interface methods implemented
- [ ] No NotImplementedException
- [ ] Proper error handling with IErrorHandler
- [ ] Retry policy (Polly) integration
- [ ] SignalR notification for data changes

### 4.3 Validate DI Registration

Check `App.xaml.cs` or `ServiceConfiguration.cs`:
- [ ] Service registered with correct lifetime (Scoped)
- [ ] All constructor dependencies registered
- [ ] No missing registrations

### 4.4 Service Implementation Matrix

| Interface | Implementation | Methods | DI Registered | Status |
|-----------|---------------|---------|---------------|--------|
| IOrderingService | OrderingService | 15/15 | ✅ | ✅ |
| IPaymentService | PaymentService | 12/12 | ✅ | ✅ |
| ISaleService | SaleService | 8/10 | ✅ | ⛔ |

### 4.5 Report Format

```
⚙️ SERVICE VALIDATION PHASE 4
============================================================
📁 Interface: IOrderingService -> OrderingService.cs
  ✅ AddItemAsync - Implemented with retry policy
  ✅ RemoveItemAsync - Implemented with SignalR notification
  ✅ UpdateQuantityAsync - Implemented
  ⛔ VoidItemAsync - NotImplementedException at line 234
  ❌ TransferItemAsync - Missing from implementation

💉 DI Registration Check:
  ✅ IOrderingService -> OrderingService (Scoped)
  ✅   |-- ISaleRepository - Registered
  ✅   |-- IErrorHandler - Registered
  ❌   |-- INewlyAddedService - NOT REGISTERED

Summary: 42/45 services fully implemented, 2 NotImplemented, 1 missing
```

---

## Phase 5: Workflow Compliance Verification

### 5.1 Load Workflow Definitions

Reference files:
- `.claude/commands/workflow-definitions.md`
- `.claude/workflows.json`
- `.claude/SI360App_Workflows.mermaid`

### 5.2 Validate Workflow Components

For each workflow (WF-AUTH-*, WF-ORDER-*, WF-PAY-*, etc.):
- [ ] View file exists
- [ ] ViewModel file exists
- [ ] Service interface exists
- [ ] Service implementation exists
- [ ] DTOs exist with required properties
- [ ] State transitions tracked correctly

### 5.3 Workflow Compliance Matrix

| Workflow | Views | ViewModels | Services | DTOs | Status |
|----------|-------|------------|----------|------|--------|
| WF-AUTH-001 | 1/1 | 1/1 | 1/1 | 2/2 | ✅ |
| WF-ORDER-001 | 2/2 | 2/2 | 2/2 | 3/3 | ✅ |
| WF-ORDER-003 | 1/1 | 1/1 | 1/1 | 4/5 | ⚠️ |
| WF-PAY-001 | 1/1 | 1/1 | 1/2 | 5/5 | ❌ |

### 5.4 Report Format

```
📋 WORKFLOW COMPLIANCE PHASE 5
============================================================
Workflow: WF-ORDER-003 (Add Items to Order)
  ✅ View: MainOrderingView.xaml exists
  ✅ ViewModel: OrderingViewModel.cs exists
  ✅ Service Interface: IOrderingService.cs exists
  ✅ Service Implementation: OrderingService.cs exists
  ✅ DTO: SaleItemDTO exists
  ⚠️ DTO: ModifierDTO missing DiscountFlag property

Workflow: WF-PAY-001 (Payment Processing)
  ✅ View: PayCheckView.xaml exists
  ✅ ViewModel: PayCheckViewModel.cs exists
  ❌ Service Interface: IRefundService.cs NOT FOUND

Summary: 8/10 workflows compliant, 1 warning, 1 failure
```

---

## Phase 6: Integration & Completeness Check

### 6.1 TODO/FIXME Scan

Search for incomplete markers:
- `// TODO:` comments
- `// FIXME:` comments
- `// HACK:` comments
- `throw new NotImplementedException();`
- `throw new NotSupportedException();`

### 6.2 Test Coverage Check

Verify test existence for:
- Each ViewModel has corresponding test file
- Each Service has corresponding test file
- Critical workflows have integration tests

### 6.3 Build Verification

- [ ] Solution builds without errors
- [ ] No compiler warnings in new code
- [ ] All projects target .NET 8.0

### 6.4 Report Format

```
🧪 INTEGRATION CHECK PHASE 6
============================================================
🚧 INCOMPLETE IMPLEMENTATIONS:
  🚧 OrderingViewModel.cs:257 - "TODO: Implement void item"
  🚧 PaymentService.cs:89 - "FIXME: Add refund validation"
  ⛔ LocalDeviceSettingsRepository.cs:22 - NotImplementedException

📊 TEST COVERAGE:
  ✅ ViewModels: 28/30 have tests (93%)
  ⚠️ Services: 40/45 have tests (89%)
  ❌ Repositories: 20/35 have tests (57%)

🏗️ BUILD STATUS:
  ✅ SI360.Domain - Builds successfully
  ✅ SI360.Infrastructure - Builds successfully
  ⚠️ SI360.UI - 3 warnings (nullable reference)
  ✅ SI360.Tests - Builds successfully

Summary: 5 TODOs, 2 FIXMEs, 3 NotImplemented, 3 build warnings
```

---

## Final Validation Report Template

```markdown
# SI360 Full System Validation Report
**Date:** {DateTime}
**Scope:** Complete System Validation

## Executive Summary

| Phase | Category | ✅ Pass | ❌ Fail | ⚠️ Warn | Status |
|-------|----------|---------|---------|---------|--------|
| 1 | Bindings | X | X | X | ✅/❌ |
| 2 | Buttons/Commands | X | X | X | ✅/❌ |
| 3 | Dialogs | X | X | X | ✅/❌ |
| 4 | Services | X | X | X | ✅/❌ |
| 5 | Workflows | X | X | X | ✅/❌ |
| 6 | Integration | X | X | X | ✅/❌ |

**Overall Status:** ✅ PASS / ❌ FAIL

## 🚨 Critical Issues (Must Fix)

1. ❌ [Phase X] Description - File:Line
2. ❌ [Phase X] Description - File:Line

## ⚠️ Warnings (Should Review)

1. ⚠️ [Phase X] Description - File:Line
2. ⚠️ [Phase X] Description - File:Line

## 🚧 Incomplete Implementations

1. 🚧 Description - File:Line - Priority
2. ⛔ NotImplementedException - File:Line - Priority

## 💡 Recommendations

### Immediate Actions
- Fix critical binding issues in Phase 1
- Implement missing service methods in Phase 4

### Suggested Improvements
- Add unit tests for untested ViewModels
- Review dialog accessibility compliance

## 📁 Files Validated

### Views (X files)
- FileName.xaml ✅/❌

### ViewModels (X files)
- FileName.cs ✅/❌

### Services (X files)
- FileName.cs ✅/❌

### Dialogs (X files)
- FileName.xaml ✅/❌
```

---

## Quick Validation Commands

### Validate Single View
```
/full-system-validation ViewOpenSalesView.xaml
```

### Validate Feature Area
```
/full-system-validation --scope=ordering
/full-system-validation --scope=payment
/full-system-validation --scope=auth
```

### Validate Specific Phase Only
```
/full-system-validation --phase=1  # Bindings only
/full-system-validation --phase=3  # Dialogs only
/full-system-validation --phase=4  # Services only
```

### Full System Validation
```
/full-system-validation --full
```

---

## Integration with Other Skills

After running full validation:

1. **For binding failures** -> Use `/workflow-verificator` for detailed fix guidance
2. **For dialog issues** -> Use `/frontend-design` for UI corrections
3. **For service issues** -> Use `/backend-service` for implementation patterns
4. **For test gaps** -> Use `/unit-test-generator` to create missing tests
5. **For workflow issues** -> Use `/workflow-verificator` with workflow compliance mode

---

## Automated Fix Suggestions

When issues are found, provide actionable fix suggestions:

### Missing Property Fix
```csharp
// Add to ViewModel:
[ObservableProperty]
private Type _propertyName;
```

### Missing Command Fix
```csharp
// Add to ViewModel:
[RelayCommand]
private async Task ActionNameAsync()
{
    try
    {
        // Implementation
    }
    catch (Exception ex)
    {
        await _errorHandler.LogErrorAsync(ex, "Error message", "User");
    }
}
```

### Missing DI Registration Fix
```csharp
// Add to App.xaml.cs ConfigureServices:
services.AddScoped<IMissingService, MissingService>();
```

### Dialog Button Height Fix
```xml
<!-- Change from -->
<Button Height="48" .../>

<!-- To -->
<Button Height="64" .../>
```

---

## Exit Criteria

Validation passes when:

1. **Zero critical failures (❌)** across all phases
2. **Warnings (⚠️)** documented and acknowledged
3. **All NotImplementedException** items have tracking issues
4. **Build succeeds** without errors
5. **Core workflows** (Auth, Order, Pay) are 100% compliant

---

Always address the user as **Rolen**.
