# Implementation Plan: User Accounts Admin Page

## 1. Requirements Analysis

### User Stories
- **Admin Story 1**: As an administrator, I need to view all users in the system to manage roles and permissions
- **Admin Story 2**: As an administrator, I need to create staff/reviewer accounts without going through registration
- **Admin Story 3**: As an administrator, I need to suspend/activate user accounts for compliance
- **Admin Story 4**: As an administrator, I need to reset user passwords if they forget them
- **Admin Story 5**: As an administrator, I need to filter users by role and account status

### Affected Modules
- **Module 1**: User & Access Management (User model, roles, statuses)
- **Module 11**: Audit Logging (activity tracking of admin actions)

### Data Models
No schema changes needed. Uses existing `User` model with:
- `id`, `email`, `firstName`, `lastName`
- `role` (APPLICANT | STAFF | REVIEWER | ADMINISTRATOR)
- `status` (ACTIVE | INACTIVE | SUSPENDED | PENDING_VERIFICATION)
- `lastLoginAt`, `createdAt`
- Relations: `applications` count

### User Roles & Permissions
- **ADMINISTRATOR** only can:
  - View all users
  - Create staff/reviewer/admin accounts
  - Change user roles
  - Suspend/activate accounts
  - Reset passwords

---

## 2. Technical Design

### Files to Create/Modify

#### Backend (API Routes) - **NEW**
```
web/src/app/api/admin/users/
├── route.ts          # GET (list) + POST (create)
└── [id]/
    └── route.ts      # GET (detail) + PUT (update)
```

#### Frontend - **EXISTS, READY**
```
web/src/app/(dashboard)/dashboard/admin/
├── users/
│   └── page.tsx      # ✅ Already exists
└── loading.tsx       # ✅ Already exists

web/src/components/dashboard/
├── admin-users-client.tsx  # ✅ Already exists
```

### New Components/Features Needed

| Item | Purpose | Status |
|------|---------|--------|
| `GET /api/admin/users` | List users with pagination, search, filters | Todo |
| `POST /api/admin/users` | Create new staff/reviewer user | Todo |
| `GET /api/admin/users/[id]` | Get user details | Todo |
| `PUT /api/admin/users/[id]` | Update user (role, status, reset password) | Todo |
| Audit Log Integration | Track admin actions | Todo |
| Email Notification | Send temp password to new user | Todo |
| Password Generation | Generate secure temp passwords | Todo |

### Validation Schemas (Zod)
```typescript
// In src/lib/validations.ts

createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['STAFF', 'REVIEWER', 'ADMINISTRATOR'])
})

updateUserSchema = z.object({
  role: z.enum(['STAFF', 'REVIEWER', 'ADMINISTRATOR']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  resetPassword: z.boolean().optional()
})
```

### Libraries Used
- `bcryptjs` — hash temp password
- `crypto` — generate random password
- Existing: Prisma, NextAuth, Zod

---

## 3. Implementation Phases

### Phase 1: API Routes (Backend)

#### 1.1 List/Create Users — `GET,POST /api/admin/users`
**File**: `web/src/app/api/admin/users/route.ts`

```typescript
// GET: List users with pagination, search, role/status filters
- Auth check: must be ADMINISTRATOR
- Query params: page (default 1), search (email/name), role, status
- Pagination: 15 per page
- Return: { users: User[], total: number }
- Select fields: id, email, firstName, lastName, role, status, lastLoginAt, createdAt, _count.applications

// POST: Create new user
- Auth check: must be ADMINISTRATOR
- Body validation: createUserSchema
- Generate temp password: 12 chars, alphanumeric + special
- Hash password with bcryptjs
- Create user with status ACTIVE
- Log activity: "User created" with email/role
- Send email with temp password
- Return: { user: User, tempPassword: string }
```

**Error Handling**:
- P2002: Email already exists → 409 Conflict
- Validation error → 400 Bad Request
- Unauthorized → 401 Unauthorized

#### 1.2 Get/Update User — `GET,PUT /api/admin/users/[id]`
**File**: `web/src/app/api/admin/users/[id]/route.ts`

```typescript
// GET: Get user details
- Auth check: must be ADMINISTRATOR
- Return user with applications count

// PUT: Update user (role, status, reset password)
- Auth check: must be ADMINISTRATOR
- Body validation: updateUserSchema
- If role change: update role, log activity
- If status change: update status, log activity
- If resetPassword: generate new temp password, send email
- Return: { user: User, tempPassword?: string }
```

**Error Handling**:
- P2025: User not found → 404 Not Found
- Validation error → 400 Bad Request

### Phase 2: Validation & Auth Middleware

#### 2.1 Add Zod Schemas
**File**: `web/src/lib/validations.ts`

```typescript
export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  phone: z.string().optional(),
  role: z.enum(["STAFF", "REVIEWER", "ADMINISTRATOR"])
});

export const updateUserSchema = z.object({
  role: z.enum(["STAFF", "REVIEWER", "ADMINISTRATOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  resetPassword: z.boolean().optional()
});
```

#### 2.2 Password Generation Helper
**File**: `web/src/lib/auth.ts` (add function)

```typescript
export function generateTempPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

### Phase 3: Activity Logging

#### 3.1 Create Activity Log on Admin Actions
**File**: `web/src/lib/activity-logger.ts` (add/extend)

```typescript
export async function logActivity(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: object
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,     // "user_created", "user_role_changed", "user_suspended"
      entity,     // "User"
      entityId,
      details,    // { oldRole: "STAFF", newRole: "REVIEWER" }
      ipAddress: request?.ip,
      userAgent: request?.headers?.get("user-agent")
    }
  });
}
```

**Log Actions**:
- `user_created` — New user account created
- `user_role_changed` — User role updated
- `user_status_changed` — User status changed
- `user_password_reset` — Password reset

### Phase 4: Email Notifications

#### 4.1 Send Temp Password Email
**File**: `web/src/lib/email.ts` (extend)

```typescript
export async function sendTempPasswordEmail(
  email: string,
  firstName: string,
  tempPassword: string,
  role: string
) {
  await transporter.sendMail({
    to: email,
    subject: "Your Account Has Been Created",
    html: `
      <p>Hi ${firstName},</p>
      <p>An admin account has been created for you.</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
      <p>Please log in and change your password immediately.</p>
    `
  });
}
```

### Phase 5: Frontend Updates (Already Done in Client)

The `admin-users-client.tsx` is already complete with:
- ✅ Create user modal
- ✅ Temp password display modal
- ✅ Search by name/email
- ✅ Filter by role/status
- ✅ Pagination
- ✅ Change role action
- ✅ Suspend/activate action
- ✅ Reset password action
- ✅ Responsive mobile/desktop

**Just needs the API routes to actually work!**

---

## 4. API Specifications

### Endpoint: GET /api/admin/users
**Query Parameters**:
```
page: number (default: 1)
search: string (optional) - search email/firstName/lastName
role: string (optional) - filter by STAFF|REVIEWER|ADMINISTRATOR
status: string (optional) - filter by ACTIVE|INACTIVE|SUSPENDED|PENDING_VERIFICATION
```

**Response**:
```json
{
  "users": [
    {
      "id": "user_1",
      "email": "staff@lgu.gov.ph",
      "firstName": "Juan",
      "lastName": "dela Cruz",
      "role": "STAFF",
      "status": "ACTIVE",
      "lastLoginAt": "2026-04-12T10:30:00Z",
      "createdAt": "2026-04-01T08:00:00Z",
      "_count": { "applications": 5 }
    }
  ],
  "total": 42
}
```

### Endpoint: POST /api/admin/users
**Request Body**:
```json
{
  "email": "newstaff@lgu.gov.ph",
  "firstName": "Pedro",
  "lastName": "Santos",
  "phone": "+639123456789",
  "role": "STAFF"
}
```

**Response**:
```json
{
  "user": { ... },
  "tempPassword": "Qx7#Kw9mPz"
}
```

### Endpoint: PUT /api/admin/users/[id]
**Request Body** (at least one):
```json
{
  "role": "REVIEWER",
  "status": "SUSPENDED",
  "resetPassword": true
}
```

**Response**:
```json
{
  "user": { ... },
  "tempPassword": "NewPw123!@"  // only if resetPassword: true
}
```

---

## 5. Acceptance Criteria

### Feature: List Users
- [ ] Admin can view first page of users (15 per page)
- [ ] Users sorted by creation date (newest first)
- [ ] Search works for email, firstName, lastName
- [ ] Filter by role shows only selected role
- [ ] Filter by status shows only selected status
- [ ] Pagination buttons work and disabled appropriately
- [ ] Mobile view shows card layout
- [ ] Desktop view shows table layout
- [ ] Loading state shows spinner
- [ ] Empty state shows "No users found"

### Feature: Create User
- [ ] Admin can click "Create User" button
- [ ] Modal form opens with all required fields
- [ ] Email validation prevents invalid emails
- [ ] Role dropdown shows STAFF, REVIEWER, ADMINISTRATOR
- [ ] Submit button disabled while loading
- [ ] On success: temp password modal shown
- [ ] User added to list immediately
- [ ] Email sent with temp password
- [ ] Activity logged: "user_created"
- [ ] Error handling shows on form (duplicate email, etc)

### Feature: Change Role
- [ ] Admin can click action menu on user
- [ ] "Change Role" option cycles through STAFF → REVIEWER → ADMINISTRATOR → STAFF
- [ ] Role updated immediately in table
- [ ] Activity logged: "user_role_changed" with oldRole/newRole
- [ ] Loading spinner shows during update
- [ ] Error alert on failure

### Feature: Suspend/Activate
- [ ] Admin can suspend ACTIVE users
- [ ] Admin can activate suspended users
- [ ] Status updated immediately
- [ ] Activity logged: "user_status_changed"
- [ ] SUSPENDED users appear greyed out (optional UX)
- [ ] Cannot suspend own account (future: add check)

### Feature: Reset Password
- [ ] Admin can reset any user's password
- [ ] Confirmation dialog shown: "Reset password for this user?"
- [ ] New temp password generated and emailed
- [ ] Temp password modal shown to admin
- [ ] Email sent to user with new password
- [ ] Activity logged: "user_password_reset"

### Security & Compliance
- [ ] Only ADMINISTRATOR role can access `/api/admin/users`
- [ ] Only ADMINISTRATOR role can access admin users page
- [ ] All inputs validated with Zod
- [ ] All admin actions logged to ActivityLog
- [ ] Temp passwords are 12+ chars with special characters
- [ ] Passwords hashed with bcryptjs before storage
- [ ] No passwords visible in API responses

### Testing Scenarios
- [ ] Create user → receives email → can login with temp password
- [ ] Change staff to reviewer → activity log shows change
- [ ] Suspend user → user cannot login
- [ ] Reset password → user receives new temp password
- [ ] Search by email → filters correctly
- [ ] Filter by role REVIEWER → shows only reviewers
- [ ] Pagination with 100 users → shows correct pages

---

## 6. Files Summary

### Create
```
web/src/app/api/admin/users/route.ts          (GET, POST)
web/src/app/api/admin/users/[id]/route.ts     (GET, PUT)
```

### Modify
```
web/src/lib/validations.ts                    (add schemas)
web/src/lib/auth.ts                           (add generateTempPassword)
web/src/lib/email.ts                          (add sendTempPasswordEmail)
web/src/lib/activity-logger.ts                (ensure logActivity exists)
```

### Already Complete (No Changes)
```
web/src/app/(dashboard)/dashboard/admin/users/page.tsx
web/src/components/dashboard/admin-users-client.tsx
```

---

## 7. Dependencies

| Package | Usage | Status |
|---------|-------|--------|
| `@prisma/client` | Database queries | ✅ Installed |
| `bcryptjs` | Password hashing | ✅ Installed |
| `crypto` | Random generation | ✅ Built-in |
| `zod` | Input validation | ✅ Installed |
| `next-auth` | Session/auth | ✅ Installed |
| `nodemailer` | Email sending | ✅ Installed |

---

## 8. Implementation Checklist

### Phase 1: Backend APIs
- [ ] Create `route.ts` for `GET /api/admin/users` (list with search/filters)
- [ ] Create `route.ts` for `POST /api/admin/users` (create user)
- [ ] Create `[id]/route.ts` for `GET /api/admin/users/[id]`
- [ ] Create `[id]/route.ts` for `PUT /api/admin/users/[id]` (update user)
- [ ] Handle all error cases (duplicate email, not found, etc)
- [ ] Add auth checks (ADMINISTRATOR only)

### Phase 2: Utilities
- [ ] Add Zod schemas to `validations.ts`
- [ ] Add `generateTempPassword()` to `auth.ts`
- [ ] Add `sendTempPasswordEmail()` to `email.ts`
- [ ] Verify `logActivity()` exists in `activity-logger.ts`

### Phase 3: Integration
- [ ] All API routes return correct response format
- [ ] ActivityLog created for all admin actions
- [ ] Emails sent on user create + password reset
- [ ] Frontend client properly calls APIs

### Phase 4: Testing
- [ ] Create test user via API → verify in DB
- [ ] Search/filter users → verify filtering works
- [ ] Change role → verify activity logged
- [ ] Reset password → verify email sent
- [ ] All error cases handled gracefully
- [ ] Mobile & desktop views work correctly

### Phase 5: QA & Deployment
- [ ] Manual testing with test admin account
- [ ] Verify emails contain correct info
- [ ] Check activity logs for completeness
- [ ] Test on production-like data size
- [ ] Performance: pagination loads quickly

---

## 9. Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | 4 API routes with full logic | 2-3 hours |
| Phase 2 | Validation, utilities, logging | 1 hour |
| Phase 3 | Integration with email, activity logs | 1 hour |
| Phase 4 | Manual testing, refinements | 1-2 hours |
| **Total** | | **5-7 hours** |

---

## 10. Future Enhancements

- [ ] Bulk user import (CSV)
- [ ] Bulk role assignment
- [ ] 2FA requirement for admin accounts
- [ ] User profile editing by admins
- [ ] Account expiration/auto-disable
- [ ] Role templates (pre-configured permission sets)
- [ ] Department/branch assignment
- [ ] User activity analytics
- [ ] Prevent deleting own admin account
- [ ] Confirm before critical actions (suspend admin)
