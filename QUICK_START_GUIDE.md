# ⚡ Quick Start Guide - Claim Schedule Management

## 🎯 What You Can Do Now

1. ✅ View all claim appointments
2. ✅ Block dates from the calendar
3. ✅ Remove blocked dates
4. ✅ Complete appointments (auto-generates permit pickup reference)
5. ✅ Cancel appointments
6. ✅ Real-time stats dashboard
7. ✅ Activity logging for all actions

---

## 🚀 Getting Started

### 1. Access the Page

Navigate to:
```
/dashboard/admin/schedules
```

**Required Role**: ADMINISTRATOR

### 2. Try the Features

#### Block a Date
1. Click the "**Block Date**" button (top right)
2. Select a date from the date picker
3. Enter a reason (e.g., "Public Holiday", "Maintenance")
4. Click "Block Date"
5. See the date appear in the calendar (red) and in the blocked dates list

#### View Blocked Dates
1. Scroll down to the "**Blocked Dates**" section
2. See all blocked dates with their reasons
3. Click "**Remove**" to unblock a date

#### Manage Appointments
1. Scroll to "**All Appointments**" table
2. For each **Scheduled** appointment:
   - Click "**Complete**" to mark as completed (✅ creates permit pickup reference)
   - Click "**Cancel**" to mark as cancelled
3. Watch the stats cards update in real-time

---

## 📊 Understanding the Dashboard

### Stats Cards (Top)
- **Scheduled**: Active appointment slots
- **Completed**: Claimed permits
- **Cancelled**: Cancelled appointment slots

### Calendar (Left)
- **Blue dates**: Today
- **Red dates**: Blocked/unavailable
- Click any date to select it

### Blocked Dates (Right)
- List of all blocked dates
- Shows reason for each block
- Remove button to unblock

### Appointments Table (Bottom)
- **Permit ID**: Reference number (BP-YYYY-XXX)
- **Applicant**: Name of person
- **Business**: Business name
- **Date & Time**: Appointment schedule
- **Location**: Where to claim
- **Status**: Scheduled/Completed/Cancelled
- **Actions**: Complete or Cancel buttons

---

## 🔗 API Endpoints (For Developers)

### Get All Data
```bash
GET /api/admin/schedules
Authorization: Bearer {session}
Response:
{
  stats: { scheduled, completed, cancelled },
  blockedDates: [{ id, date, reason }],
  appointments: [{ id, permitId, applicantName, ... }]
}
```

### Block a Date
```bash
POST /api/admin/schedules/blocked-dates
Content-Type: application/json
{
  "date": "2026-04-15",
  "reason": "Public Holiday"
}
```

### Unblock a Date
```bash
DELETE /api/admin/schedules/blocked-dates/{id}
```

### Complete/Cancel Appointment
```bash
PATCH /api/admin/schedules/appointments/{id}
Content-Type: application/json
{
  "status": "completed" | "cancelled"
}
```

---

## 🎨 Customization

### Change Auto-Refresh Rate
Edit `src/hooks/use-schedule.ts`:
```typescript
refetchInterval: 30000, // Change to any milliseconds
```

### Change Cache Duration
Edit `src/lib/schedules.ts`:
```typescript
CacheTTL.MEDIUM  // 5 minutes
CacheTTL.LONG    // 10 minutes
```

### Change Pagination Limit
Edit `src/app/api/admin/schedules/route.ts`:
```typescript
take: 50, // Change appointment limit
```

---

## 🐛 Troubleshooting

### "Forbidden" Error
- ✅ Make sure you're logged in as ADMINISTRATOR
- ✅ Check your role in the user profile

### Appointments Not Showing
- ✅ Make sure there are CONFIRMED slot reservations in database
- ✅ Check the appointments table is scrolled fully
- ✅ Try refreshing page (Ctrl+R)

### Blocked Date Not Appearing
- ✅ Wait 30 seconds for auto-refresh
- ✅ Manual refresh: Close modal and reopen
- ✅ Check calendar legend (red = blocked)

### Stats Not Updating
- ✅ Stats auto-refresh every 30 seconds
- ✅ Manual refresh: Click "Block Date" button to trigger refresh

---

## 📱 Responsive Design

The page works on:
- ✅ Desktop (full layout)
- ✅ Tablet (2-column layout)
- ✅ Mobile (stacked, scrollable)

---

## 🔒 Permissions

| Action | Required Role | Status |
|--------|---|---|
| View appointments | ADMINISTRATOR | ✅ |
| Block date | ADMINISTRATOR | ✅ |
| Unblock date | ADMINISTRATOR | ✅ |
| Complete appointment | STAFF, ADMINISTRATOR | ✅ |
| Cancel appointment | STAFF, ADMINISTRATOR | ✅ |

---

## 📝 Examples

### Block a Holiday
1. Click "Block Date"
2. Select December 25, 2026
3. Reason: "Christmas Holiday"
4. Click "Block Date"

### Complete an Appointment
1. Find appointment in table
2. Click "Complete" button
3. Appointment status changes to ✅ Complete
4. Claim reference generated for permit pickup

### View Administration Activity
- Check `activity_logs` table in database
- Includes: who blocked what, when, why
- For auditing and compliance

---

## ✨ Features You're Using

- **Real-time Data**: React Query auto-refetch (30 sec)
- **Caching**: Redis for performance
- **Validation**: Zod schemas prevent bad data
- **Logging**: Every action tracked
- **Transactions**: Safe database operations
- **Error Handling**: Friendly error messages
- **Responsive**: Works on all devices

---

## 🎓 Learn More

- Full backend documentation: `BACKEND_IMPLEMENTATION.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
- Code structure: `CLAUDE.md` (Project guide)

---

**Ready to manage claims! 🚀**
