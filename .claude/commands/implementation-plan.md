# Implementation Plan Skill (`/implementation-plan`)

**Purpose**: Sprint planning, feature prioritization, and gap analysis.

## Reference Documents

- `PROJECT-PLAN.md` - Full project scope
- `tasks.md` - Task audit and tracker
- `MISSING_REQUIREMENTS.md` - Dependencies & missing services

## Current Status

**Completed Modules**:
- User & Access Management (4 roles, auth, 2FA)
- Permit Application Management (workflow, review)
- Document Management (upload, verification)
- Application Tracking (SSE, real-time)
- Claim Scheduling (slots, reservations)
- Payment Integration (PayMongo, OTC)
- Permit Issuance (PDF with QR)
- Business Location Mapping (Leaflet)

**In Progress**: 
- Admin features
- Analytics & reporting
- SMS/Email batch operations

**Not Started**:
- Renewal application workflow (partial)
- Government API integrations (mock mode)
- Performance optimization
- Security audit

## Priority Matrix

### P0 - Critical Path
- User authentication working end-to-end
- Application submission workflow
- Document verification
- Permit issuance

### P1 - Core Features
- Claim scheduling and pickup
- Payment processing
- Real-time notifications
- Business location mapping

### P2 - Admin Features
- User management
- Reports & analytics
- System settings
- Audit logs

### P3 - Enhancements
- SMS notifications
- Email templates
- Government API
- Performance optimization

## Sprint Planning

**Sprint 1** (2 weeks):
- Finish auth implementation
- Complete application CRU (no D)
- Basic document upload

**Sprint 2** (2 weeks):
- Document verification workflow
- Claim scheduling
- Payment integration

**Sprint 3** (2 weeks):
- Permit issuance with PDF
- Real-time notifications
- Business location mapping

**Sprint 4** (2 weeks):
- Admin user management
- Analytics & reporting
- Testing & bug fixes

## Gap Analysis

| Feature | Status | Blocker | ETC |
|---------|--------|---------|-----|
| DTI Verification | Mock | API key | 1 sprint |
| SMS Notifications | Template ready | API key | 1 sprint |
| Email Templates | Some | Review | 1 sprint |
| Performance | Not started | None | 1 sprint |
| Security audit | Not started | None | 1 sprint |

## Key Metrics

- Feature completion: 85%
- Test coverage: 75%
- Performance: On target
- Security: Audit pending
- Accessibility: WCAG 2.1 AA

