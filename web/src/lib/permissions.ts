/**
 * RBAC Permission System using CASL.js
 * Fine-grained permission control for all entities
 */

import { AbilityBuilder, PureAbility } from '@casl/ability';

// ============================================================================
// Action & Subject Definitions
// ============================================================================

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'review' | 'approve' | 'reject' | 'issue' | 'export';

export type Subjects =
  | 'Application'
  | 'Document'
  | 'User'
  | 'Schedule'
  | 'ClaimReference'
  | 'Permit'
  | 'Report'
  | 'SystemSetting'
  | 'ActivityLog'
  | 'Payment'
  | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

// ============================================================================
// Role-based Ability Definitions
// ============================================================================

export type Role = 'APPLICANT' | 'STAFF' | 'REVIEWER' | 'ADMINISTRATOR';

export function defineAbilitiesFor(role: Role, _userId?: string): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

  switch (role) {
    case 'ADMINISTRATOR':
      // Administrators can do everything
      can('manage', 'all');
      break;

    case 'REVIEWER':
      // Reviewers can review/approve/reject applications
      can('read', 'Application');
      can('review', 'Application');
      can('approve', 'Application');
      can('reject', 'Application');
      can('read', 'Document');
      can('update', 'Document'); // Verify documents
      can('read', 'ClaimReference');
      can('read', 'Permit');
      can('read', 'Report');
      can('export', 'Report');
      can('read', 'User'); // View applicant details
      can('read', 'ActivityLog');
      cannot('delete', 'Application');
      cannot('manage', 'SystemSetting');
      cannot('manage', 'User');
      break;

    case 'STAFF':
      // Staff can manage daily operations
      can('read', 'Application');
      can('read', 'Document');
      can('update', 'Document'); // Verify documents
      can('read', 'ClaimReference');
      can('update', 'ClaimReference'); // Process claims
      can('read', 'Permit');
      can('issue', 'Permit');
      can('read', 'Schedule');
      can('create', 'Schedule');
      can('update', 'Schedule');
      can('read', 'Report');
      can('export', 'Report');
      can('read', 'User');
      can('read', 'Payment');
      can('create', 'Payment'); // Record OTC payments
      can('read', 'ActivityLog');
      cannot('delete', 'Application');
      cannot('manage', 'SystemSetting');
      cannot('delete', 'User');
      break;

    case 'APPLICANT':
      // Applicants can manage their own applications
      can('create', 'Application');
      can('read', 'Application'); // Own applications only (filtered at query level)
      can('update', 'Application'); // Own draft applications
      can('delete', 'Application'); // Own draft applications
      can('create', 'Document'); // Upload documents
      can('read', 'Document'); // Own documents
      can('read', 'ClaimReference'); // Own claim references
      can('read', 'Permit'); // Own permits
      can('read', 'Schedule');
      can('create', 'Payment'); // Make payments
      can('read', 'Payment'); // Own payments
      cannot('manage', 'User');
      cannot('manage', 'SystemSetting');
      cannot('manage', 'Report');
      cannot('review', 'Application');
      cannot('approve', 'Application');
      cannot('reject', 'Application');
      cannot('issue', 'Permit');
      break;

    default:
      // No permissions for unknown roles
      break;
  }

  return build();
}

// ============================================================================
// Permission Checking Helpers
// ============================================================================

export function canPerformAction(role: Role, action: Actions, subject: Subjects): boolean {
  const ability = defineAbilitiesFor(role);
  return ability.can(action, subject);
}

export function getPermittedActions(role: Role, subject: Subjects): Actions[] {
  const allActions: Actions[] = ['create', 'read', 'update', 'delete', 'manage', 'review', 'approve', 'reject', 'issue', 'export'];
  const ability = defineAbilitiesFor(role);
  return allActions.filter((action) => ability.can(action, subject));
}

// ============================================================================
// Navigation Permissions (for sidebar filtering)
// ============================================================================

export interface NavPermission {
  path: string;
  label: string;
  requiredAbility: { action: Actions; subject: Subjects };
}

export const navigationPermissions: NavPermission[] = [
  { path: '/dashboard', label: 'Dashboard', requiredAbility: { action: 'read', subject: 'Application' } },
  { path: '/dashboard/applications', label: 'Applications', requiredAbility: { action: 'read', subject: 'Application' } },
  { path: '/dashboard/applications/new', label: 'New Application', requiredAbility: { action: 'create', subject: 'Application' } },
  { path: '/dashboard/tracking', label: 'Tracking', requiredAbility: { action: 'read', subject: 'Application' } },
  { path: '/dashboard/documents', label: 'Documents', requiredAbility: { action: 'read', subject: 'Document' } },
  { path: '/dashboard/schedule', label: 'Schedule', requiredAbility: { action: 'read', subject: 'Schedule' } },
  { path: '/dashboard/claim-reference', label: 'Claim Reference', requiredAbility: { action: 'read', subject: 'ClaimReference' } },
  { path: '/dashboard/review', label: 'Review Applications', requiredAbility: { action: 'review', subject: 'Application' } },
  { path: '/dashboard/verify-documents', label: 'Verify Documents', requiredAbility: { action: 'update', subject: 'Document' } },
  { path: '/dashboard/claims', label: 'Claims', requiredAbility: { action: 'update', subject: 'ClaimReference' } },
  { path: '/dashboard/issuance', label: 'Permit Issuance', requiredAbility: { action: 'issue', subject: 'Permit' } },
  { path: '/dashboard/admin/users', label: 'User Management', requiredAbility: { action: 'manage', subject: 'User' } },
  { path: '/dashboard/admin/schedules', label: 'Schedule Management', requiredAbility: { action: 'manage', subject: 'Schedule' } },
  { path: '/dashboard/admin/reports', label: 'Reports', requiredAbility: { action: 'export', subject: 'Report' } },
  { path: '/dashboard/admin/settings', label: 'Settings', requiredAbility: { action: 'manage', subject: 'SystemSetting' } },
];

export function getPermittedNavigation(role: Role): NavPermission[] {
  const ability = defineAbilitiesFor(role);
  return navigationPermissions.filter((nav) =>
    ability.can(nav.requiredAbility.action, nav.requiredAbility.subject)
  );
}
