# Permit Application Implementation - Complete

## Summary
Implemented a **5-step permit application form** for applicants to submit NEW business permit applications with validation, document uploads, and payment method selection.

---

## Files Created/Modified

### 1. **Validation Schemas** (`web/src/lib/validations.ts`)
Added comprehensive Zod schemas for all 5 permit application steps:

- `permitApplicationStep1Schema` — Business information (name, type, owner, TIN, location)
- `permitApplicationStep2Schema` — Document uploads validation
- `permitApplicationStep3Schema` — Assessment details (area, employees, capital, notes)
- `permitApplicationStep4Schema` — Payment method selection with notes
- `permitApplicationStep5Schema` — Confirmation (terms agreement)
- `fullPermitApplicationSchema` — Merged schema for final submission

**Type exports**: All individual step types + `FullPermitApplicationInput`

---

### 2. **Permit Application Client Component** (`web/src/components/dashboard/permit-application-client.tsx`)
Comprehensive multi-step form client component with:

#### Features:
- ✅ Visual step indicator with progress tracking (5 steps shown)
- ✅ Form state management using `react-hook-form` + Zod validation
- ✅ Step-by-step validation with error messages
- ✅ Previous/Next navigation with data persistence
- ✅ Back to Dashboard link at top
- ✅ Required documents checklist (8 documents pre-defined)
- ✅ Document file upload with preview & removal
- ✅ Business type & barangay/municipality dropdowns
- ✅ Assessment form for business details (area, employees, capital)
- ✅ Payment method selection (GCash, Maya, Bank Transfer, OTC, Cash)
- ✅ Application summary review before submission
- ✅ Save Draft functionality (client-side localStorage + optional backend)
- ✅ Terms agreement checkbox
- ✅ Error handling and user feedback
- ✅ Loading states on submission

#### Steps Flow:
1. **Business Info** — Core business details (name, type, owner, TIN, location)
2. **Documents** — Upload 8 required documents (drag-drop or click)
3. **Assessment** — Business area, employee count, capital investment, notes
4. **Payment** — Select payment method (5 options) + optional reference notes
5. **Confirmation** — Review application summary and accept terms

#### UI:
- Responsive design (mobile/tablet/desktop)
- Blue theme matching dashboard
- Tailwind CSS + CVA components
- Completed steps show green checkmarks
- Error messages for each field/section
- Loading states on buttons
- Disabled Previous button on Step 1

---

### 3. **API Endpoint** (`web/src/app/api/applications/route.ts`)
**Existing endpoint** with POST support:

#### POST `/api/applications`
**Purpose**: Create new Application record from submitted form

**Request Body**:
```json
{
  "type": "NEW",
  "businessName": "Juan's Store",
  "businessType": "Retail",
  "businessAddress": "123 Main St",
  "businessBarangay": "San Jose",
  "businessCity": "Magalona",
  "businessProvince": "Negros Occidental",
  "businessZipCode": "6100",
  "tinNumber": "123-456-789-012",
  "businessPhone": "09171234567",
  "businessEmail": "juan@email.com",
  "numberOfEmployees": 5,
  "businessArea": 150,
  "capitalInvestment": 500000,
  "ownerName": "Juan Dela Cruz",
  "paymentMethod": "GCASH",
  "paymentNotes": "Reference: ABC123",
  "agreedToTerms": true
}
```

**Response** (201 Created):
```json
{
  "application": {
    "id": "cuid-string",
    "applicationNumber": "BP-2026-000001",
    "status": "SUBMITTED",
    "type": "NEW",
    "businessName": "Juan's Store",
    ...
  }
}
```

**Behavior**:
- ✅ Validates input against Zod schema
- ✅ Generates unique application number
- ✅ Creates Application with status `SUBMITTED`
- ✅ Creates ApplicationHistory entry
- ✅ Creates ActivityLog entry
- ✅ Invalidates cached data (Zustand + cache)
- ✅ Supports `submitAsDraft` flag for saving drafts
- ✅ Authentication required

---

### 4. **Apply Page** (`web/src/app/(dashboard)/dashboard/apply/page.tsx`)
Server component that:
- Protects route (requires authentication)
- Renders `<PermitApplicationClient />` component

**Route**: `/dashboard/apply`

---

## Database Impact

### Application Model
Form data stored in existing `Application` model:

```prisma
model Application {
  // From Step 1: Business Info
  businessName        String           // Required
  businessType        String           // Required
  businessAddress     String           // Required
  businessBarangay    String?          // From barangay dropdown
  businessCity        String?          // From municipality dropdown
  businessPhone       String?
  businessEmail       String?
  tinNumber           String?

  // From Step 3: Assessment
  businessArea        Float?
  numberOfEmployees   Int?
  capitalInvestment   Decimal?         // Optional

  // From Step 4 & 5: Stored as JSON
  additionalData      Json? {
    ownerName
    paymentMethod
    paymentNotes
  }

  // Standard fields
  type                ApplicationType   // Set to "NEW"
  status              ApplicationStatus // Set to "SUBMITTED"
  applicantId         String           // Current user
  applicationNumber   String           // Generated
  submittedAt         DateTime         // Auto-set to now()
  createdAt           DateTime         // Auto-set
  updatedAt           DateTime         // Auto-set
}
```

### Activity Log & History
Each application submission creates:
- `ActivityLog` — audit entry with business name + application number
- `ApplicationHistory` — status transition (null → SUBMITTED)

---

## Workflow After Application Submission

1. User completes 5-step form → Application created with status `SUBMITTED`
2. User redirected to `/dashboard/applications/{applicationId}`
3. Application enters review queue for STAFF/REVIEWER roles
4. Status transitions: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
5. Payment processing (if approved)
6. Permit issuance (if approved)

---

## Key Differences from Enrollment Form

| Aspect | Enrollment | Permit Application |
|--------|-----------|-------------------|
| **Steps** | 5 | 5 |
| **Owner Info** | Detailed (name, phone, email, position) | Simplified (just name) |
| **Location** | Requires all fields | Barangay + municipality dropdowns |
| **Documents** | Optional file uploads | Checklist of 8 required documents |
| **Assessment** | Simple (area, employees, capital) | Enhanced (area, employees, capital, notes) |
| **Payment** | Not included | Full payment method selection |
| **Created Status** | DRAFT | SUBMITTED |
| **Use Case** | Register business first time | Apply for permit on existing business |

---

## Future Enhancements

- [ ] Document type validation (PDF only, max 5MB, virus scan)
- [ ] Real-time document checklist verification
- [ ] Government agency verification API integration
- [ ] Payment link generation (PayMongo checkout)
- [ ] Email notification with application number
- [ ] SMS reminder before payment deadline
- [ ] Inspector assignment and scheduling
- [ ] Online payment status sync
- [ ] PDF export of application
- [ ] Application status timeline view
- [ ] Bulk application tracking (admin)

---

## Security

- ✅ Server-side validation (Zod schemas)
- ✅ Client-side validation (UX improvement)
- ✅ Authentication required (session check)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CSRF protection (NextAuth middleware)
- ✅ Rate limiting on API routes
- ✅ Activity logging for audit trail
- ✅ Permission-based access (applicant can only view own applications)

---

## Testing

### Manual Testing Steps:
1. **Navigate** to `/dashboard/apply`
2. **Step 1**: Fill business info (all required fields marked with *)
   - Try to proceed → validation should block incomplete forms
3. **Step 2**: Upload at least one document
   - Should see checklist of 8 required documents
   - Drag-drop or click upload functionality
4. **Step 3**: Fill optional assessment details (area, employees, capital, notes)
5. **Step 4**: Select payment method from 5 options
6. **Step 5**: Review summary, check terms checkbox, submit
7. **Verify**: Redirected to `/dashboard/applications/{id}`
8. **Check**: Activity logs show `APPLICATION_SUBMITTED` action

### Validation Tests:
- Business name: Min 2, max 200 chars
- Owner name: Min 2, max 100 chars
- TIN format: Must match xxx-xxx-xxx-xxx
- Payment method: One option must be selected
- Terms: Must be checked before submission
- Documents: At least one must be uploaded (Step 2)

---

## Dependencies

All existing packages are used (no new dependencies):
- `react-hook-form` — Form state (already installed)
- `zod` — Validation (already installed)
- `@hookform/resolvers` — Hook form validation (already installed)
- `lucide-react` — Icons (already installed)

---

## Performance Considerations

- ✅ Form state managed in component (not synced to DB on every keystroke)
- ✅ Draft save is optional (localStorage or async to backend)
- ✅ Application cache invalidated only on successful submission
- ✅ API endpoint uses optimized Prisma queries
- ✅ No N+1 queries (user relations pre-loaded)

---

## Accessibility

- ✅ Form labels with `<label>` elements
- ✅ Error messages linked to fields
- ✅ Semantic HTML structure
- ✅ Keyboard navigation (Tab through form)
- ✅ Step indicator provides context
- ✅ Clear "Previous" button disabled state
- ✅ Document checklist with visual feedback

---

## Status After Implementation

✅ **Step 1 - Business Info**: Fully functional
✅ **Step 2 - Documents**: File upload with checklist
✅ **Step 3 - Assessment**: Optional detailed fields
✅ **Step 4 - Payment**: Method selection form
✅ **Step 5 - Confirmation**: Review + submit

**Ready for Testing**: All 5 steps complete and functional
