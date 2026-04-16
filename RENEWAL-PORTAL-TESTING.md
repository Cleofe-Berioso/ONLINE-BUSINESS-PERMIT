# Renewal Portal - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### 1. Start the Development Server
```bash
cd web
npm run dev
```
Server will be available at `http://localhost:3000`

### 2. Seed Test Data (If Not Already Done)
```bash
npm run db:seed
```

### 3. Login as an Applicant with Renewals Available
- **Email**: `juan@example.com`
- **Password**: `Password123!`

---

## 📍 Navigation

Once logged in as Juan (renewal-eligible applicant):

1. **Click "Renewal Portal"** in the sidebar, or navigate to `/dashboard/renew`
2. You'll see the renewal sidebar with 7 navigation options:
   - Dashboard
   - Renew Permit
   - **Renewal History** ← NEW (Click this!)
   - Claim Schedule
   - Documents
   - Notifications
   - Profile

---

## ✅ Testing Checklist

### Page: Renewal History (`/dashboard/renew/history`)
- [ ] Page loads without errors
- [ ] Shows "Renewal History" heading and subheading
- [ ] Displays list of renewal applications (green card)
- [ ] Shows application number, business name, and status
- [ ] Status badge shows correct color (green=approved, blue=under review, red=rejected)
- [ ] Summary stats display at bottom (Total, Approved, Pending counts)
- [ ] Click "View Details" opens application details
- [ ] If approved: "Schedule Claim" button visible
- [ ] If rejected: "Start New Renewal" button visible

### Page: Documents (`/dashboard/renew/documents`)
- [ ] Page loads without errors
- [ ] Shows document summary stats (Total, Verified, Pending, Rejected)
- [ ] Lists documents with file names and types
- [ ] Status badges show correctly (green=verified, yellow=pending, red=rejected)
- [ ] Download button works for each document
- [ ] Upload Replacement button visible for rejected documents
- [ ] Document requirements card shows at bottom

### Page: Claim Schedule (`/dashboard/renew/claim-schedule`)
- [ ] Page loads without errors
- [ ] If appointment exists: Shows date, time, confirmation number
- [ ] Shows "Before Your Appointment" checklist
- [ ] Shows office contact information
- [ ] If no appointment: Shows "Schedule Appointment" button
- [ ] Shows any past appointments in history section

### Page: Notifications (`/dashboard/renew/notifications`)
- [ ] Page loads without errors
- [ ] Email/SMS/In-app notification toggles visible
- [ ] Save Preferences button works
- [ ] Recent notifications display with timestamps
- [ ] Mark all as read button visible

### Page: Profile (`/dashboard/renew/profile`)
- [ ] Page loads without errors
- [ ] Personal information displays (pre-filled with user data)
- [ ] Edit Profile button toggles edit mode
- [ ] Security section shows 2FA status
- [ ] Password change option visible
- [ ] Account actions (data download, deactivate, logout all) visible

### Access Control
- [ ] Login as `juan@example.com` → Can access renewal portal ✅
- [ ] Logout and login as `pedro@example.com` (no permits) → Redirects to dashboard ❌
- [ ] Login as `staff@lgu.gov.ph` (STAFF role) → Cannot access `/dashboard/renew` ❌

---

## 🐛 Troubleshooting

### Page shows blank/loading spinner forever
- Check browser console (F12) for errors
- Check NextJS terminal for API errors
- Verify API endpoints are responding (network tab in DevTools)

### "View Details" button doesn't work
- This links to `/dashboard/applications/{id}` - may need permission check
- Verify application exists in database

### Status badges show wrong colors
- Check the ApplicationStatus enum in schema
- Component should match colors to status values

### TypeScript errors on build
```bash
npm run typecheck
```
Should show 0 errors if implementation is correct.

---

## 📞 Support

For questions or issues:
1. Check `RENEWAL-PORTAL-COMPLETE.md` for detailed documentation
2. Review `CLAUDE.md` for project guidelines
3. Check the database schema in `prisma/schema.prisma`

---

## 🎯 Success Criteria

You'll know the renewal portal is working correctly when:

✅ All 7 pages load without errors
✅ Navigation sidebar shows all 7 menu items with correct icons
✅ Renewal History page displays past renewals with status
✅ Access control properly restricts non-applicants
✅ All API endpoints return proper data (check Network tab)
✅ TypeScript compiles with 0 errors
✅ No console errors in browser developer tools

---

## 📊 Next Steps After Testing

1. **Code Review**
   - Review components in `src/components/dashboard/renewal-*-content.tsx`
   - Review API routes in `src/app/api/renewals/*/route.ts`

2. **Integration**
   - Connect document upload functionality
   - Implement appointment scheduling form
   - Add notification delivery (email/SMS)
   - Implement profile update API

3. **Deployment**
   - Test in staging environment
   - Load testing with realistic data
   - Security audit (authentication, authorization)
   - User acceptance testing (UAT) with stakeholders

---

**Happy Testing! 🚀**
