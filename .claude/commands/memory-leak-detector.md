# Memory Leak Detector Skill (`/memory-leak-detector`)

**Purpose**: Detect and prevent memory leaks in the Next.js application.

## Common Leak Sources

### 1. SSE Listeners Not Cleaned Up
**Problem**:
```typescript
useEffect(() => {
  const eventSource = new EventSource("/api/events");
  eventSource.addEventListener("message", handler);
  // Missing cleanup!
}, []);
```

**Fix**:
```typescript
useEffect(() => {
  const eventSource = new EventSource("/api/events");
  eventSource.addEventListener("message", handler);
  
  return () => {
    eventSource.close();
  };
}, []);
```

### 2. Timers & Intervals Without Cleanup
**Problem**:
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Updates
  }, 5000);
}, [dependency]);
```

**Fix**:
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Updates
  }, 5000);
  
  return () => clearInterval(timer);
}, [dependency]);
```

### 3. Zustand Store Subscriptions
**Problem**:
```typescript
useEffect(() => {
  store.subscribe((state) => {
    // Handle state
  });
}, []);
```

**Fix**:
```typescript
useEffect(() => {
  const unsubscribe = store.subscribe((state) => {
    // Handle state
  });
  
  return () => unsubscribe();
}, []);
```

### 4. Event Listeners on Window/Document
**Problem**:
```typescript
useEffect(() => {
  window.addEventListener("resize", handler);
}, []);
```

**Fix**:
```typescript
useEffect(() => {
  window.addEventListener("resize", handler);
  
  return () => {
    window.removeEventListener("resize", handler);
  };
}, []);
```

### 5. Request Cancellation
**Problem**:
```typescript
useEffect(() => {
  fetch("/api/data").then(setData);
}, []);
```

**Fix**:
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetch("/api/data", { signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== "AbortError") throw err;
    });
  
  return () => controller.abort();
}, []);
```

## Detection Commands

### Find Missing Cleanup
```bash
grep -r "addEventListener\|setInterval\|setTimeout" src/ | grep -v "return\|cleanup"
```

### Check for Unsubscribes
```bash
grep -r "\.subscribe(" src/ | grep -v "return () =>"
```

### Verify EventSource Cleanup
```bash
grep -r "EventSource" src/ -A 5 | grep "close()"
```

## Testing for Leaks

### Chrome DevTools
1. F12 → Performance tab
2. Record: Record action multiple times
3. Take Heap Snapshot
4. Compare snapshots - should see same objects

### Memory Profiler
```javascript
// In console
1. Take heap snapshot (baseline)
2. Perform action 10 times
3. Take heap snapshot (final)
4. Compare - detached DOM nodes / listeners?
```

## Memory Leak Patterns

| Pattern | Leak | Fix |
|---------|------|-----|
| useEffect without cleanup | Yes | Add return cleanup |
| EventListener | Yes | removeEventListener in return |
| setInterval | Yes | clearInterval in return |
| Zustand subscribe | Yes | Call unsubscribe in return |
| setTimeout | Maybe | clearTimeout if long-running |
| Fetch abort | Yes | AbortController signal |

## Audit Checklist

- [ ] All useEffect hooks have cleanup returns
- [ ] All EventListeners have corresponding removeEventListener
- [ ] All setInterval/setTimeout have clear calls
- [ ] All subscribe() calls unsubscribe on cleanup
- [ ] All fetch calls use AbortController
- [ ] No console.log leaking large objects
- [ ] Dynamic components properly unmounted

