# Memory Leak Detector — OBPS Client & Server Leak Prevention

## Purpose

Detect and fix memory leaks in the Online Business Permit System — React component leaks, SSE connection leaks, Zustand store leaks, Prisma connection exhaustion, and server-side accumulation.

## Usage

```
/memory-leak-detector <area-or-symptom>
```

## Common Leak Sources

### 1. SSE (Server-Sent Events) Leaks

**Risk**: `useSSE` hook not cleaning up EventSource connections

```typescript
// ✅ Correct pattern in src/hooks/use-sse.ts
useEffect(() => {
  const eventSource = new EventSource("/api/events");
  eventSource.onmessage = handleMessage;

  return () => {
    eventSource.close(); // MUST close on unmount
  };
}, []);
```

**Check**: Does the SSE hook clean up on component unmount?

### 2. React useEffect Cleanup

**Risk**: Subscriptions, intervals, or event listeners not cleaned up

```typescript
// ❌ Leak: interval never cleared
useEffect(() => {
  setInterval(fetchStatus, 5000);
}, []);

// ✅ Fixed: clear on unmount
useEffect(() => {
  const id = setInterval(fetchStatus, 5000);
  return () => clearInterval(id);
}, []);
```

### 3. Zustand Store Subscriptions

**Risk**: Store subscriptions in components that unmount

```typescript
// ✅ Zustand handles this automatically with useStore selector
// But manual subscribe() calls need cleanup:
useEffect(() => {
  const unsubscribe = useAppStore.subscribe((state) => {
    // handle state change
  });
  return () => unsubscribe();
}, []);
```

### 4. React Query Stale Queries

**Risk**: Queries keep running for unmounted components

```typescript
// ✅ React Query handles this — but verify:
const { data } = useQuery({
  queryKey: ["applications"],
  queryFn: fetchApplications,
  enabled: isVisible, // Only run when component is visible
  refetchInterval: isVisible ? 30000 : false, // Stop polling when hidden
});
```

### 5. Prisma Connection Exhaustion (Server-side)

**Risk**: Too many Prisma Client instances in development

```typescript
// ✅ Correct pattern in src/lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Check**: Is Prisma client stored in globalThis for dev hot-reload?

### 6. File Handle / Stream Leaks (Server-side)

**Risk**: File streams or S3 streams not closed

```typescript
// ✅ Always close streams in finally block
const stream = await storage.getReadStream(filePath);
try {
  // process stream
} finally {
  stream.destroy();
}
```

### 7. BullMQ Worker Leaks

**Risk**: Job workers not shut down gracefully

```typescript
// ✅ In src/lib/queue.ts — ensure graceful shutdown
process.on("SIGTERM", async () => {
  await worker.close();
  await queue.close();
});
```

## Detection Tools

### Browser (Client-side)

```
Chrome DevTools → Memory tab → Heap snapshot
1. Take snapshot before opening dashboard
2. Navigate around, open/close features
3. Take snapshot again
4. Compare — look for detached DOM nodes, growing arrays
```

### Node.js (Server-side)

```bash
# Check process memory
node -e "console.log(process.memoryUsage())"

# Enable Node.js memory profiling
NODE_OPTIONS='--inspect' npm run dev
# Then: Chrome → chrome://inspect → Memory tab
```

### Prisma Connection Check

```bash
# Check active DB connections
docker exec obps-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## Checklist

- [ ] All `useEffect` hooks have cleanup functions
- [ ] SSE connections closed on component unmount
- [ ] `setInterval` / `setTimeout` cleared on unmount
- [ ] Event listeners removed on unmount
- [ ] Prisma client is singleton (globalThis pattern)
- [ ] File/S3 streams properly closed
- [ ] BullMQ workers have graceful shutdown
- [ ] No detached DOM nodes in heap snapshots
- [ ] React Query queries disabled when not visible
