# Claim Schedule Redesign — Applicant Dashboard (2026-04-13)

## Overview
Complete redesign of the Claim Schedule page to match the provided design with calendar picker, upcoming appointments sidebar, and important reminders.

## Changes Made

### 1. **Sidebar Component Fix** ✅
**File**: `web/src/components/dashboard/sidebar.tsx`

- ✅ Removed admin navigation from ApplicantSidebar
- ✅ Removed role-based conditional logic
- ✅ Simplified to applicant-only navigation
- ✅ Removed unnecessary type imports

**Result**: Applicants now see ONLY applicant navigation.

---

### 2. **Claim Schedule Page Redesign** ✅
**File**: `web/src/app/(dashboard)/dashboard/schedule/page.tsx`

#### New Layout
```
┌─────────────────────────────────────┐
│       Claim Schedule                │
│  View and manage your appointments  │
└─────────────────────────────────────┘

┌──────────────────────────┬──────────────────┐
│                          │                  │
│  Calendar                │  Upcoming        │
│  (color-coded dates)     │  Appointments    │
│                          │                  │
│  └─ Date Legend          │  └─ Details      │
│                          │  └─ Actions      │
├──────────────────────────┤                  │
│                          │                  │
│  Time Slots              │                  │
│  (after date selected)   │                  │
│                          │                  │
└───────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  Important Reminders                     │
│  • Operating hours                       │
│  • Arrival time                          │
│  • Required documents                    │
│  • Unavailable dates                     │
│  • Reschedule policy                     │
└──────────────────────────────────────────┘
```

#### Features Implemented

**1. Calendar Picker**
- Full month calendar with navigation arrows
- Color-coded dates:
  - 🔴 **Scheduled** (pink) — dates with available slots
  - ⚫ **Unavailable** (gray) — blocked/maintenance dates
  - ⚪ **Weekend** (gray) — non-operational dates
  - 🔵 **Selected** (blue) — currently chosen date
- Legend showing date types
- Click to select date

**2. Time Slot Selection**
- Appears after date is selected
- Shows available time slots
- Displays remaining capacity per slot
- Radio-button style selection
- Clear Selection & Confirm Appointment buttons

**3. Upcoming Appointments Sidebar**
- Sticky positioning (desktop)
- Shows all scheduled appointments for applicant
- For each appointment displays:
  - Reference number (BP-2025-001)
  - Business name
  - Status badge (scheduled/completed/cancelled)
  - Date
  - Time
  - Location
- Cancel Appointment button with confirmation
- "No appointments" state message

**4. Important Reminders Section**
- Orange alert box at bottom of page
- 5 key reminders:
  1. Claim appointments available Monday-Friday only
  2. Please arrive 15 minutes before scheduled time
  3. Bring valid ID and application reference number
  4. Red marked dates unavailable (holidays/maintenance)
  5. Contact office 24 hours in advance to reschedule

#### Technical Implementation

**State Management**
```typescript
const [schedules, setSchedules] = useState<ScheduleData[]>([]);
const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
```

**Data Fetching**
- `/api/schedules` — Get available dates and time slots
- `/api/claims/today` — Get upcoming appointments for applicant
- Both fetched in parallel with `Promise.all()`

**Calendar Rendering**
- Custom date calculation (days in month, first day, blank cells)
- Date status determination:
  - `getDateStatus()` returns: scheduled, unavailable, weekend, available
  - Styled accordingly with Tailwind classes
- Month navigation with arrow buttons
- Date selection with click handlers

**Appointment Management**
- Display upcoming appointments with details
- Cancel appointment with DELETE to `/api/claims/{id}`
- Confirmation dialog before cancel
- Error/success state handling

**Responsive Design**
- Left column: Calendar + Time Slots (2/3 width on lg)
- Right column: Upcoming Appointments (1/3 width on lg, sticky)
- Full width on mobile with normal stacking
- Responsive grid: `lg:grid-cols-3` at large breakpoints

#### API Integration

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/schedules` | GET | Fetch available claim dates and time slots |
| `/api/claims/today` | GET | Fetch applicant's upcoming appointments |
| `/api/schedules/reserve` | POST | Reserve a time slot |
| `/api/claims/{id}` | DELETE | Cancel an appointment |

#### Component Dependencies
- `Button` — UI component
- `Card` / `CardContent` / `CardHeader` / `CardTitle` / `CardDescription` — Layout
- `Alert` — Error/success messages
- `Badge` — Status display (variant: "success" or "default")
- `LoadingSpinner` — Loading state
- Lucide icons: `CalendarCheck`, `Clock`, `MapPin`, `AlertCircle`, `X`

---

## Before & After Comparison

| Feature | Before | After |
|---------|--------|-------|
| **Date Selection** | Simple grid of buttons | Full calendar with colors |
| **Calendar UI** | Text labels | Visual month/day grid |
| **Upcoming Appointments** | Not shown | Full sidebar with details |
| **Date Coding** | None | 4-color legend |
| **Reminders** | None | Orange alert section |
| **Layout** | Single column | 2-column (calendar + sidebar) |
| **Responsiveness** | Basic | Mobile-optimized + sticky sidebar |
| **Appointment Actions** | None | Cancel with confirmation |

---

## Testing Checklist

- [ ] Calendar renders correct month
- [ ] Date status colors display correctly
- [ ] Month navigation works (prev/next buttons)
- [ ] Clicking date selects it (blue border)
- [ ] Time slots appear after date selection
- [ ] Time slot selection works
- [ ] Confirm appointment saves (redirects to claim-reference)
- [ ] Cancel appointment shows confirmation dialog
- [ ] Upcoming appointments load from API
- [ ] Appointment details display correctly
- [ ] Important reminders section is visible
- [ ] Mobile layout stacks correctly
- [ ] Sticky sidebar works on desktop
- [ ] Error messages display on failed fetch
- [ ] Loading state shows spinner

---

## Notes for Future Development

1. **Admin Sidebar**: If admin/staff sidebars are needed, create separate components (`AdminSidebar`, `StaffSidebar`) — don't mix into `ApplicantSidebar`

2. **API Requirements**:
   - `/api/claims/today` should return `{ appointments: UpcomingAppointment[] }`
   - Appointment cancellation should use DELETE method

3. **Internationalization**: Currently hardcoded in English. Add next-intl translations for:
   - Month names
   - Day abbreviations
   - UI text
   - Reminder text

4. **Date Format**: Currently using `toLocaleDateString("en-PH")` for Philippine English

5. **Calendar Customization**: Could add:
   - external library like `react-day-picker` for more features
   - Time zone considerations
   - Recurring unavailable dates patterns

---

## Files Modified

1. `web/src/components/dashboard/sidebar.tsx` — Removed admin nav, simplified
2. `web/src/app/(dashboard)/dashboard/schedule/page.tsx` — Complete redesign

## Build Status

✅ TypeScript: No errors in schedule page
✅ All imports resolved
✅ Component types validated
⚠️ Pre-existing errors in admin schedules API (unrelated to this change)

---

## Design References

The layout matches the provided design screenshot:
- Calendar on left (April 2026)
- Upcoming appointments on right
- Important reminders at bottom
- Color-coded date legend
- Responsive sidebar layout
