# Performance Profiler Skill (`/performance-profiler`)

**Purpose**: Identify and optimize performance bottlenecks.

## Profiling Domains

### 1. Prisma Queries
**Check for N+1**: Query in loop instead of using include

```typescript
// BAD - N+1
const apps = await prisma.application.findMany();
apps.forEach(app => console.log(app.applicant)); // N+1!

// GOOD
const apps = await prisma.application.findMany({
  include: { applicant: true },
});
```

**Optimization**: Add Prisma indexes on frequently filtered columns

```prisma
@@index([userId, status])
@@index([createdAt])
```

### 2. React Rendering
**Optimize**: Avoid re-rendering with `React.memo` and `useMemo`

```typescript
const TableRow = React.memo(({ item }) => <tr>...</tr>);
```

**Large lists**: Use virtualization or pagination

### 3. Bundle Size
**Check**: `npm run build` → analyze with source-map-explorer

**Optimize**:
- Code splitting for admin pages: `dynamic(() => import(...))`
- Remove unused dependencies
- Lazy load heavy libraries

### 4. Network & Caching
**Cache with Redis**:
```typescript
const result = await cacheOrCompute(`app:${id}`, async () => {
  return await prisma.application.findUnique({ where: { id } });
}, { ttl: 5 * 60 }); // 5 minutes
```

**HTTP caching**: Set proper headers for static assets

### 5. API Response
**Paginate**: Return limited results with skip/take

```typescript
const [items, total] = await Promise.all([
  prisma.application.findMany({ skip: 0, take: 15 }),
  prisma.application.count(),
]);
```

**Select only needed**: Use Prisma `select:` not `include:`

### 6. SSE Performance
**Heartbeat**: Keep-alive every 30 seconds
**Payload size**: Minimize event data
**Cleanup**: Remove listeners on disconnect

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API response | <500ms | TBD |
| Page load | <2s | TBD |
| First paint | <1s | TBD |
| Bundle size | <400KB | TBD |
| DB query | <100ms | TBD |

## Commands

```bash
# Analyze bundle size
npm run build

# Monitor API responses
npm run test:e2e -- --reporter=list

# Test performance
npm run db:studio  # check query performance
```

