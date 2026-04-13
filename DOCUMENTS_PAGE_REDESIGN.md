# Documents Page Redesign — Applicant Dashboard (2026-04-13)

## Overview
Complete redesign of the Documents page to match the provided design with upload drop zone, document cards, status badges, and action buttons.

## Changes Made

### File 1: `web/src/app/(dashboard)/dashboard/documents/page.tsx`
**Server Component** — Page wrapper with document listing

#### New Features
1. **Page Header**
   - Title: "My Documents"
   - Subtitle: "Manage all your uploaded documents"

2. **Document List Layout** (Card-based)
   - Replaced table with card layout matching design
   - Each card displays:
     - 📄 Document icon (red file icon)
     - Document name (bold, truncated on overflow)
     - File type, size, upload date on second line
     - Application reference number
     - Status badge (StatusBadge component)
     - 3 Action buttons: View, Download, Delete

3. **Document Card Content**
   ```
   [Icon] Document Name                [Status] [👁] [⬇] [🗑]
          PDF • 2.3 MB • Uploaded 3/10/2026
          Application: APP-2024-00123
   ```

4. **Action Buttons**
   - View (👁 icon) — Opens/previews document
   - Download (⬇ icon) — Downloads document
   - Delete (🗑 icon) — Removes document (red hover state)
   - All buttons are icon-only for compact display
   - Hover state changes to darker gray
   - Delete button turns red on hover

5. **Empty State**
   - Dashed border box when no documents
   - Message: "No documents uploaded yet. Use the upload zone above to get started."

### File 2: `web/src/components/dashboard/documents-client.tsx`
**Client Component** — Upload section with drag & drop

#### Upload Drop Zone Features
1. **Visual Design**
   - Dashed blue border (border-blue-300)
   - Light blue background (bg-blue-50)
   - 12px padding (p-12)
   - Rounded corners
   - Centered content

2. **Upload Elements**
   - 📤 Upload icon (Lucide)
   - "Upload New Document" heading
   - "Drag and drop files here or click to browse" subtitle
   - Blue "Select Files" button
   - "Accepted formats: PDF, JPG, PNG (Max 5MB per file)" info
   - Hidden file input

3. **Drag & Drop Functionality**
   - Active state: Border turns blue-500, background brightens
   - Drop handler validates and processes files
   - Multiple file support

4. **File Validation**
   - Size limit: 5MB per file
   - Allowed types: PDF, JPEG, PNG
   - Error messages for invalid files
   - Shows count of successfully uploaded files

5. **State Management**
   - `isDragActive` — Track drag state
   - `uploading` — Show loading state on button
   - `error` — Display upload errors
   - `success` — Show success message
   - Auto-reload on successful upload after 1.5s

6. **Error/Success Alerts**
   - Red alert for errors (with dismiss)
   - Green alert for success (auto-dismiss)

#### API Integration
- `POST /api/documents/upload` — Upload files
- Expects FormData with `files` field
- Returns `{ documents: Document[] }`

### Features Removed
- ❌ Old table-based layout
- ❌ Separate mobile/desktop views
- ❌ Removed header row styling

### Features Added
- ✅ Upload drop zone with drag & drop
- ✅ Card-based document layout
- ✅ Action buttons (View, Download, Delete)
- ✅ File validation
- ✅ Success/error alerts
- ✅ Responsive design
- ✅ Status badge integration

---

## Design Comparison

### Before
```
Table layout with columns:
[Icon] Document | App | Type | Version | Status | Uploaded
[pdf] filename  | APP | PDF  |   v1    | Verified | 3/10
```

### After
```
Card layout:
┌─────────────────────────────────────────────┐
│ [Icon] Filename                [Status] [👁][⬇][🗑]│
│        PDF • 2.3 MB • Uploaded 3/10/2026        │
│        Application: APP-2024-00123              │
└─────────────────────────────────────────────┘
```

---

## Layout Structure

```
My Documents
Manage all your uploaded documents

┌──────────────────────────────────┐
│  Upload New Document              │
│  📤                               │
│  Drag and drop files here...      │
│  [Select Files]                   │
│  Accepted: PDF, JPG, PNG (5MB)   │
└──────────────────────────────────┘

Uploaded Documents

[Document Card 1]
[Document Card 2]
[Document Card 3]
```

---

## Technical Details

### Database Query
```typescript
const documents = await prisma.document.findMany({
  where: { uploadedBy: session.user.id },
  orderBy: { createdAt: "desc" },
  include: {
    application: {
      select: { applicationNumber: true, businessName: true },
    },
  },
});
```

### Component Composition
- **documents/page.tsx** (Server) — Data fetching + layout
- **documents-client.tsx** (Client) — Upload interaction

### Styling
- Tailwind CSS v4 utility classes
- Responsive: Works on mobile + desktop
- Hover states: `hover:bg-gray-50`, `hover:text-gray-600`
- Colors: Gray-900 text, blue accents, red for delete

### Icons
- Upload (Lucide) — In upload zone
- File icon (inline SVG) — In document cards
- Eye icon (inline SVG) — View action
- Download icon (inline SVG) — Download action
- Trash icon (inline SVG) — Delete action

---

## API Routes Required

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/documents/upload` | POST | Upload new documents |
| `/api/documents/[id]/download` | GET | Download document |
| `/api/documents/[id]/view` | GET | View/preview document |
| `/api/documents/[id]` | DELETE | Delete document |

---

## Testing Checklist

- [ ] Documents list displays correctly
- [ ] Upload zone renders with correct styling
- [ ] Drag & drop activates visual feedback
- [ ] File selection via button works
- [ ] File validation accepts PDF/JPG/PNG only
- [ ] File size validation (5MB limit)
- [ ] Error messages display correctly
- [ ] Success message shows after upload
- [ ] Page reloads to show new documents
- [ ] Status badges display correctly
- [ ] Action buttons have correct icons
- [ ] Hover states work on buttons
- [ ] Empty state displays when no documents
- [ ] Document card layout is responsive
- [ ] Application reference displays

---

## Notes for Future Development

1. **Action Button Handlers**: Currently buttons are placeholders. Need to implement:
   - View: Open PDF in modal or new tab
   - Download: Trigger download endpoint
   - Delete: Show confirmation, call delete API

2. **Document Preview**: Consider adding:
   - Modal popup for PDF preview
   - Image lightbox for JPG/PNG
   - Error state if file not available

3. **Batch Operations**: Could add:
   - Checkbox for multi-select
   - Delete multiple documents
   - Download multiple as ZIP

4. **File Upload Progress**: Enhancement:
   - Progress bar during upload
   - Cancel upload button
   - Per-file status display

5. **File Type Icons**: Improve:
   - Different colors for PDF vs Image
   - File type detection
   - Custom icons per type

6. **Accessibility**: Add:
   - ARIA labels for icon buttons
   - Keyboard navigation (Enter to open)
   - Screen reader descriptions

---

## Files Modified/Created

1. ✅ `web/src/app/(dashboard)/dashboard/documents/page.tsx` — Redesigned
2. ✅ `web/src/components/dashboard/documents-client.tsx` — Created (new)

## Build Status

✅ TypeScript: No errors in documents page
✅ All imports resolved
✅ Component composition verified
⚠️ Pre-existing unrelated errors

---

## Design References

The layout matches the provided screenshot:
- Blue drop zone at top with icon and instructions
- Document cards listed below with status badges
- Action icons aligned to the right
- Responsive card layout
- Clean, professional appearance
