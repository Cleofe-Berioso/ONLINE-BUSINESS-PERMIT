# Performance Profiler — OBPS Next.js Performance Analysis

## Purpose

Profile and optimize performance across the Online Business Permit System — bundle size, Prisma query performance, React rendering, API response times, and load testing.

## Usage

```
/performance-profiler <area-or-page-to-profile>
```

## Profiling Areas

### 1. Next.js Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# Check build output
npm run build  # Review .next/standalone size and page sizes
```

**Targets**: First Load JS < 100KB per route, Total < 300KB

### 2. Prisma Query Performance

```typescript
// Enable query logging in development
prisma.$on("query", (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});
```

**Checklist**:

- [ ] No N+1 queries — use `include` or `select` properly
- [ ] Cursor-based pagination (not offset) for large tables
- [ ] Indexes on frequently filtered columns
- [ ] `@@index` composites for multi-column WHERE clauses
- [ ] Transactions don't hold locks too long

### 3. React Rendering

- Use React DevTools Profiler to detect unnecessary re-renders
- Server Components by default — only `'use client'` when needed
- Memoize expensive computations with `useMemo`
- Lazy load heavy components with `dynamic()`
- Use Suspense boundaries for streaming

### 4. API Response Times

```bash
# k6 load test
npx k6 run tests/performance/load-test.js
```

**Targets**: p95 < 500ms for reads, p95 < 1000ms for writes

### 5. Caching Strategy

| Layer       | Implementation                      | TTL                  |
| ----------- | ----------------------------------- | -------------------- |
| Redis       | `src/lib/cache.ts` (ioredis 5.4.1)  | Per-key configurable |
| In-memory   | Map fallback when Redis unavailable | Same                 |
| React Query | Client-side stale-while-revalidate  | 5 min default        |
| Next.js     | ISR / revalidate for public pages   | Varies               |

### 6. Image & Asset Optimization

- Use `next/image` for automatic optimization
- Icons: pre-generated PWA icon set in `public/icons/`
- Fonts: Use `next/font` for zero-layout-shift loading

## Performance Monitoring

- **Sentry**: Performance tracing (optional, `src/lib/monitoring.ts`)
- **Prometheus**: Metrics endpoint at `/api/metrics`
- **Web Vitals**: Track LCP, FID, CLS in production

## Optimization Patterns

```typescript
// Dynamic import for heavy components
const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false,
});

// React Query with proper stale time
const { data } = useQuery({
  queryKey: ['applications', page],
  queryFn: () => fetchApplications(page),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Prisma: select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true, role: true },
  where: { status: 'ACTIVE' },
});
```

## Performance-Critical Lib Modules

| Module | Performance Impact | Optimization |
|--------|-------------------|--------------|
| `src/lib/cache.ts` | Redis caching | Cache hot queries (applications, permits) for 5-10min TTL |
| `src/lib/prisma.ts` | Database perf | Use `select` not `include` to avoid over-fetching |
| `src/lib/queue.ts` | Async processing | Offload PDF generation, email sending to BullMQ jobs |
| `src/lib/pdf.ts` | Document generation | Cache generated permits, async job processing |
| `src/lib/storage.ts` | File operations | CloudFront CDN for S3, lazy-load large uploads |
| `src/lib/email.ts` | Email delivery | Queue email jobs, don't block request |
| `src/lib/sms.ts` | SMS delivery | Batch SMS sending, queue non-critical messages |
| `src/lib/validations.ts` | Request validation | Parse once, reuse validated data (no re-parsing) |

## Checklist

- [ ] Bundle size within targets
- [ ] No N+1 Prisma queries
- [ ] Redis caching for hot paths
- [ ] React Server Components used where possible
- [ ] Lazy loading for non-critical components
- [ ] k6 load test passes under expected load
- [ ] Core Web Vitals within "Good" thresholds
