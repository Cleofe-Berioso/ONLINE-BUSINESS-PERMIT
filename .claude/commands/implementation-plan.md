# Implementation Plan Management

## Overview

This skill manages the HoardNest implementation roadmap, sprint planning, and feature prioritization. The full implementation plan is documented in `Docs/IMPLEMENTATION_PLAN.md`.

## Plan Structure

The implementation plan covers:

- **Current State Assessment** — What's working, what's partial, what's missing
- **Gap Analysis** — Backend API endpoints needed (81 total across 6 categories)
- **Priority Matrix** — P0 (Critical) through P3 (Nice-to-have)
- **Sprint Roadmap** — 5 sprints over 10 weeks
- **Feature Specifications** — Detailed specs for each major feature
- **Technical Debt** — Items to address during implementation

## Key Reference Documents

| Document              | Location                      | Purpose                         |
| --------------------- | ----------------------------- | ------------------------------- |
| Implementation Plan   | `Docs/IMPLEMENTATION_PLAN.md` | Master plan with all details    |
| Architecture Overview | `Docs/Architecture/`          | System architecture docs        |
| API Documentation     | `Docs/API/`                   | API endpoint documentation      |
| Migration Guide       | `Docs/Migration/`             | Firebase → PostgreSQL migration |
| Testing Strategy      | `Docs/Testing/`               | Testing approach and coverage   |

## Commands

### Show current sprint status

```
/implementation-plan status
```

### Show priority items

```
/implementation-plan priorities
```

### Show gap analysis summary

```
/implementation-plan gaps
```

### Show specific sprint details

```
/implementation-plan sprint <number>
```

## Priority Framework

| Priority | Label        | Criteria                        | Timeline               |
| -------- | ------------ | ------------------------------- | ---------------------- |
| P0       | Critical     | Security, data integrity, auth  | Sprint 1 (Weeks 1-2)   |
| P1       | High         | Core marketplace flow, orders   | Sprint 2-3 (Weeks 3-6) |
| P2       | Medium       | Analytics, notifications, rider | Sprint 4 (Weeks 7-8)   |
| P3       | Nice-to-have | Advanced analytics, reporting   | Sprint 5 (Weeks 9-10)  |

## API Endpoint Categories (81 Total)

| Category                  | Count | Priority |
| ------------------------- | ----- | -------- |
| Admin Management          | 21    | P0-P1    |
| Analytics & Reporting     | 7     | P2       |
| Rider Management          | 12    | P1-P2    |
| Notification System       | 8     | P2       |
| Item & Listing Management | 13    | P1       |
| Test Data & Development   | 7     | P3       |
| Financial Management      | 13    | P1-P2    |

## Sprint Overview

| Sprint | Focus                      | Weeks | Key Deliverables                                |
| ------ | -------------------------- | ----- | ----------------------------------------------- |
| 1      | Foundation & Security      | 1-2   | Auth hardening, admin CRUD, city validation     |
| 2      | Core Marketplace           | 3-4   | Item management, order flow, payment processing |
| 3      | Delivery & Riders          | 5-6   | Rider management, delivery tracking, earnings   |
| 4      | Notifications & Analytics  | 7-8   | WebSocket notifications, real-time analytics    |
| 5      | Polish & Advanced Features | 9-10  | Financial forecasting, reporting, optimization  |

## Usage

When implementing features from the plan:

1. Check the current sprint in `Docs/IMPLEMENTATION_PLAN.md`
2. Pick the highest priority unimplemented item
3. Follow the feature specification in the plan
4. Update the plan status after implementation
5. Run tests to verify the implementation
