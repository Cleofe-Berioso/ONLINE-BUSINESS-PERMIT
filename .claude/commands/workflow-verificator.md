# Workflow Verificator Skill (`/workflow-verificator`)

**Purpose**: Verify workflow implementations are complete and correct end-to-end.

## Verification Checklist

### API Route Registration
- Endpoint exists: `src/app/api/[group]/[id]/route.ts`
- Correct HTTP method: `GET`, `POST`, `PUT`, `DELETE`
- Auth check: `await auth()` on protected routes
- Zod validation: `[schema].safeParse(data)`
- Error handling: try/catch with proper status codes
- Returns JSON: `NextResponse.json()`

### Page ↔ API Wiring
- Page component at correct path
- Calls correct API endpoint
- Request body matches Zod schema
- Response type matches props
- Loading/error states handled
- Notifications on success/error

### Data Model Wiring
- Prisma query includes relations
- Response includes needed fields
- No sensitive data (sanitize user)
- Pagination correct (skip/take)
- Filters applied correctly

### Authentication
- Session check before DB access
- Role verified: `session?.user?.role`
- 401 for unauthorized, 403 for forbidden
- Middleware blocks non-authenticated
- Re-authentication works

### SSE Real-time
- Event emitted: `broadcast()`
- Event name matches client listener
- Client connected: `src/hooks/use-sse.ts`
- Component subscribes to event
- Cleanup function prevents leak
- DevTools shows EventSource

### Form Validation
- Zod schema covers all fields
- Client matches server validation
- Error messages shown
- Required fields block submission
- Custom validations work

### Database
- Unique constraints enforced
- Foreign keys prevent orphaned data
- Cascading deletes work
- TTL indexes on time-series
- No N+1 queries

### Error Handling
- All errors logged
- Friendly user messages
- Proper status codes
- No stack traces in production
- Retry logic for transient errors

## Verification Commands

```bash
npm run typecheck
npm run test:e2e
npm run db:studio
npx prisma validate
```

## Common Missing Pieces

- API exists but component doesn't call it
- Wrong schema validation
- Response fields don't match props
- Missing auth checks
- SSE event not listened to
- Client/server validation differs
- Errors not shown to user
- Memory leaks in SSE listeners

