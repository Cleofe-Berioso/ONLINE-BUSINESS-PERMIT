---
name: memory-leak-detector
description: Memory leak detection specialist for SI360 POS. Use for finding event subscription leaks, undisposed resources, unbounded collections, and timer/handler cleanup issues.
---

# Memory Leak Detector Skill

You are a memory leak detection and prevention specialist for the SI360 POS system. When invoked, systematically identify memory leaks from event subscriptions, undisposed resources, unbounded collections, and improper cleanup patterns in the WPF/.NET 8.0 application.

## Context

| Aspect | Details |
|--------|---------|
| **Framework** | WPF (.NET 8.0) with Clean Architecture |
| **MVVM** | CommunityToolkit.Mvvm 8.2.2 |
| **Real-time** | SignalR (PosSignalRClient) with event subscriptions |
| **DI Lifetimes** | Singleton (GlobalState, SignalR), Scoped (Services), Transient (ViewModels, Views) |
| **Timers** | DispatcherTimer in App.xaml.cs, polling timers in ViewModels |
| **Long-Running** | POS app runs 12-16 hours continuously per shift |

---

## Leak Categories

### Category 1: Event Subscription Leaks

**How WPF Events Cause Leaks:**
```csharp
// LEAK: Publisher (long-lived) holds reference to subscriber (short-lived)
// ViewModel subscribes to singleton event but never unsubscribes
_globalState.PropertyChanged += OnGlobalStateChanged;

// When ViewModel is "destroyed" (view navigated away):
// - GC cannot collect ViewModel because GlobalState holds reference
// - All ViewModel's dependencies also cannot be collected
// - Each navigation creates a new ViewModel → memory grows indefinitely
```

**Detection Patterns:**
```csharp
// SEARCH FOR: Event subscriptions in constructors/Loaded without matching unsubscribe
// Pattern 1: += without corresponding -=
someObject.SomeEvent += Handler;      // FOUND
someObject.SomeEvent -= Handler;      // MISSING?

// Pattern 2: Lambda subscriptions (can never unsubscribe!)
someObject.SomeEvent += (s, e) => { }; // LEAK - lambda creates closure

// Pattern 3: SignalR .On() without .Off() or Dispose
_connection.On<DbChangeEvent>("DbChanged", OnDbChanged); // Can this be cleaned up?
```

**Known Risk Areas:**

| File | Subscription | Unsubscription | Status |
|------|-------------|----------------|--------|
| `ChargeTipDialog.xaml.cs` | `Loaded += OnLoaded` (line 20) | `OnClosed -= handler` (line 40) | GOOD |
| `CheckDetailsDialog.xaml.cs` | `Loaded += OnLoaded` (line 46) | No Unloaded/Closed handler | LEAK RISK |
| `OrderingViewModel.cs` | SignalR `_connection.On(...)` | Unknown - check for Dispose | LEAK RISK |
| `App.xaml.cs` | `DispatcherTimer` (line 105) | `Timer.Stop()` but no dispose | LOW RISK |
| `PosSignalRClient.cs` | `Reconnecting/Reconnected/Closed` | Unknown | CHECK |

### Category 2: IDisposable Violations

**Rule:** Any class that holds unmanaged resources, event subscriptions, timers, or IDisposable dependencies MUST implement IDisposable.

**Pattern for ViewModels:**
```csharp
public partial class OrderingViewModel : ObservableObject, IDisposable
{
    private readonly CompositeDisposable _disposables = new();
    private bool _disposed;

    public OrderingViewModel(/* deps */)
    {
        // Track subscriptions
        _globalState.PropertyChanged += OnGlobalStateChanged;
        _disposables.Add(() => _globalState.PropertyChanged -= OnGlobalStateChanged);

        // Track SignalR
        _disposables.Add(() => _posSignalRClient?.DisposeAsync().AsTask().Wait());
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _disposables.Dispose();
        GC.SuppressFinalize(this);
    }
}
```

**Simple CompositeDisposable:**
```csharp
public class CompositeDisposable : IDisposable
{
    private readonly List<Action> _cleanupActions = new();

    public void Add(Action cleanup) => _cleanupActions.Add(cleanup);

    public void Add(IDisposable disposable) =>
        _cleanupActions.Add(disposable.Dispose);

    public void Dispose()
    {
        foreach (var action in _cleanupActions)
        {
            try { action(); } catch { /* log but don't throw */ }
        }
        _cleanupActions.Clear();
    }
}
```

### Category 3: Unbounded Collections

**Risk:** ObservableCollections that grow without bounds during long shifts.

**Detection Pattern:**
```csharp
// RISK: Collection.Add() without corresponding Clear() or size check
public ObservableCollection<LogEntry> Logs { get; } = new();

public void AddLog(string message)
{
    Logs.Add(new LogEntry(message)); // Grows forever!
}

// FIX: Bounded collection
public void AddLog(string message)
{
    Logs.Add(new LogEntry(message));
    while (Logs.Count > MaxLogEntries)
        Logs.RemoveAt(0);
}
```

**Known Risk Areas:**

| Collection | File | Max Size | Growth Pattern |
|------------|------|----------|----------------|
| `_transactions` (List) | `PaymentService.cs:21` | Unbounded | Grows per payment |
| `GroupedSeatOrders` | `OrderingViewModel.cs` | Per-sale | Rebuilt on refresh |
| `OpenChecks` | `OrderingViewModel.cs` | Per-room | Rebuilt on refresh |
| `MenuItems` | `OrderingViewModel.cs` | Per-department | Rebuilt on selection |
| `LoggedMessages` | `TestErrorHandler.cs` | Unbounded (tests only) | OK for tests |

### Category 4: Timer and Polling Leaks

**Risk:** Timers that continue running after their owning view is destroyed.

**Detection Pattern:**
```csharp
// LEAK: Timer starts but is never stopped when view navigates away
private readonly DispatcherTimer _pollingTimer;

public void StartPolling()
{
    _pollingTimer.Start(); // Starts ticking
}
// Missing: StopPolling() called on view unload

// FIX: Stop timer on view destruction
public void Dispose()
{
    _pollingTimer?.Stop();
    _pollingTimer?.IsEnabled = false;
}
```

**Known Timers:**

| Timer | File | Start | Stop | Status |
|-------|------|-------|------|--------|
| `DispatcherTimer` | `App.xaml.cs:105` | OnStartup | OnExit | CHECK |
| `_orderPollingTimer` | `TableSelectionViewModel.cs` | LoadTables | Unknown | CHECK |
| Polling ViewModels | `OrderItemPollingViewModel.cs` | Initialize | Unknown | CHECK |
| Polling ViewModels | `PaymentStatusPollingViewModel.cs` | Initialize | Unknown | CHECK |

### Category 5: WPF-Specific Leaks

**Binding Leaks:**
```xml
<!-- LEAK: Binding to non-INotifyPropertyChanged source -->
<TextBlock Text="{Binding SomeProperty}" />
<!-- If DataContext is plain object (not ObservableObject), WPF creates
     a PropertyDescriptor that pins the object in memory -->

<!-- FIX: Always use ObservableObject or [ObservableProperty] -->
```

**Static Resource Leaks:**
```xml
<!-- SAFE: StaticResource evaluated once -->
<TextBlock Style="{StaticResource BodyTextStyle}" />

<!-- RISK: DynamicResource creates binding that holds references -->
<TextBlock Style="{DynamicResource BodyTextStyle}" />
<!-- Use DynamicResource only when theme switching is needed -->
```

**Event Handler in XAML:**
```xml
<!-- LEAK RISK: Click handler keeps view alive if handler is on long-lived object -->
<Button Click="OnButtonClick" />

<!-- SAFER: Command binding (auto-disconnects with DataContext) -->
<Button Command="{Binding ClickCommand}" />
```

---

## Execution Checklist

When invoked with `$ARGUMENTS`:

### Phase 1: Event Subscription Audit
- [ ] Search all `.cs` files for `+=` event subscriptions
- [ ] For each subscription, verify matching `-=` unsubscription exists
- [ ] Flag lambda event subscriptions (can never unsubscribe)
- [ ] Check SignalR `.On()` subscriptions for cleanup
- [ ] Verify all dialog code-behind has Closed/Unloaded cleanup

### Phase 2: IDisposable Audit
- [ ] List all classes that subscribe to events from longer-lived objects
- [ ] List all classes that create timers
- [ ] List all classes that hold IDisposable references
- [ ] Verify each implements IDisposable with proper cleanup
- [ ] Check that DI container disposes scoped/transient IDisposables

### Phase 3: Collection Bounds Audit
- [ ] Find all `ObservableCollection<T>` declarations
- [ ] For each, identify growth pattern (bounded rebuild vs. unbounded add)
- [ ] Flag any collection that grows without limit during normal operation
- [ ] Verify polling ViewModels clear old data on refresh
- [ ] Check `List<PaymentTransaction>` for size management

### Phase 4: Timer Lifecycle Audit
- [ ] List all DispatcherTimer instances
- [ ] Verify each has Stop() called on view/ViewModel destruction
- [ ] Check polling intervals are reasonable (not too frequent)
- [ ] Verify timers don't reference disposed objects in callbacks

### Phase 5: WPF Binding Audit
- [ ] Check for bindings to non-ObservableObject DataContexts
- [ ] Minimize DynamicResource usage (prefer StaticResource)
- [ ] Verify Command bindings used instead of event handlers where possible
- [ ] Check for x:Name references that could pin objects

---

## Diagnostic Helpers

```csharp
// Add to App.xaml.cs for leak monitoring during development
#if DEBUG
public static class MemoryDiagnostics
{
    private static readonly Dictionary<string, WeakReference> TrackedObjects = new();

    public static void Track(string name, object obj)
    {
        TrackedObjects[name] = new WeakReference(obj);
    }

    public static void ReportLeaks()
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        foreach (var (name, weakRef) in TrackedObjects)
        {
            if (weakRef.IsAlive)
                System.Diagnostics.Debug.WriteLine($"[LEAK] {name} is still alive!");
            else
                System.Diagnostics.Debug.WriteLine($"[OK] {name} was collected.");
        }
    }
}
#endif
```

---

## Validation

```bash
# Find event subscriptions without unsubscriptions
grep -rn "+=" --include="*.cs" SI360.UI/ | grep -v "//\|Command\|=>.*=>\|get;\|set;"
# Cross-reference with -= occurrences

# Find classes with timers that don't implement IDisposable
grep -rn "DispatcherTimer\|System.Timers.Timer" --include="*.cs" SI360.UI/
# Verify each file also has : IDisposable

# Find unbounded collection growth
grep -rn "\.Add(" --include="*.cs" SI360.UI/ViewModels/ | grep "ObservableCollection\|_transactions"
# Verify corresponding Clear() or size limits exist
```

Always address the user as **Rolen**.
