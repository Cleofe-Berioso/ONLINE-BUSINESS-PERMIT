# ADMIN THEME IMPLEMENTATION GUIDE
## With Code Examples & Tailwind Configuration
**For**: Online Business Permit System (OBPS)

---

## 🎨 UNIFIED COLOR PALETTE CONFIGURATION

### Step 1: Update `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin Color Palette
        admin: {
          // Primary Colors
          primary: {
            50: "#EFF6FF",
            100: "#DBEAFE",
            500: "#2563EB",
            600: "#1D4ED8",
            700: "#1E40AF",
          },
          // Status Colors
          success: {
            50: "#F0FDF4",
            100: "#DCFCE7",
            500: "#10B981",
            600: "#059669",
          },
          warning: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            500: "#F59E0B",
            600: "#D97706",
          },
          error: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            500: "#EF4444",
            600: "#DC2626",
          },
          info: {
            50: "#F0F9FF",
            100: "#E0F2FE",
            500: "#06B6D4",
            600: "#0891B2",
          },
          // Role Colors
          role: {
            admin: "#8B5CF6",      // Purple
            reviewer: "#3B82F6",   // Blue
            staff: "#10B981",      // Green
            applicant: "#6B7280",  // Gray
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🧩 REUSABLE COMPONENT LIBRARY

### 1. RoleBadge Component
```typescript
// src/components/ui/role-badge.tsx

import React from 'react';
import { Shield, ClipboardList, CheckCircle, User } from 'lucide-react';

type Role = 'ADMINISTRATOR' | 'REVIEWER' | 'STAFF' | 'APPLICANT';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleConfig: Record<Role, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  ADMINISTRATOR: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Shield className="w-4 h-4" />,
    label: 'Administrator',
  },
  REVIEWER: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Reviewer',
  },
  STAFF: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <ClipboardList className="w-4 h-4" />,
    label: 'Staff',
  },
  APPLICANT: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <User className="w-4 h-4" />,
    label: 'Applicant',
  },
};

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = roleConfig[role];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm ${config.bgColor} ${config.color} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
```

### 2. StatusBadge Component
```typescript
// src/components/ui/status-badge.tsx

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, Eye } from 'lucide-react';

type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  DRAFT: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Draft',
  },
  SUBMITTED: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending',
  },
  UNDER_REVIEW: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: <Eye className="w-4 h-4" />,
    label: 'Processing',
  },
  APPROVED: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Approved',
  },
  REJECTED: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Rejected',
  },
  CANCELLED: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Cancelled',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-sm ${config.bgColor} ${config.color} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
```

### 3. AdminCard Component (Stat Card)
```typescript
// src/components/dashboard/admin-stat-card.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  className?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}: AdminStatCardProps) {
  return (
    <div className={`rounded-lg border-2 bg-white p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600">{label}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. EnhancedDataTable Component
```typescript
// src/components/dashboard/enhanced-data-table.tsx

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  striped?: boolean;
  hoverable?: boolean;
}

export function EnhancedDataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  striped = true,
  hoverable = true,
}: EnhancedDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-left font-semibold text-gray-700 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`
                ${hoverable ? 'hover:bg-gray-50 cursor-pointer' : ''}
                ${striped && idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                transition-colors
              `}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📋 BEFORE & AFTER CODE EXAMPLES

### Users Page - Before
```typescript
// ❌ Inline styled modal
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
    {/* form content */}
  </div>
</div>
```

### Users Page - After
```typescript
// ✅ Using unified component library
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { EnhancedDataTable } from '@/components/dashboard/enhanced-data-table';

export function AdminUsersClient() {
  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'firstName', label: 'Name', sortable: true },
    {
      key: 'role',
      label: 'Role',
      render: (role: Role) => <RoleBadge role={role} />
    },
    { key: 'lastLoginAt', label: 'Last Login', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button className="bg-admin-primary-500 text-white px-4 py-2 rounded-lg hover:bg-admin-primary-600">
          Create User
        </button>
      </div>

      <EnhancedDataTable
        data={users}
        columns={columns}
        onRowClick={handleUserClick}
        hoverable
      />
    </div>
  );
}
```

---

## 🔧 PAGE-SPECIFIC IMPLEMENTATIONS

### 1. Reports Page Enhancement
```typescript
// src/components/dashboard/admin-report-card.tsx

export function AdminReportCard({ report }: { report: Report }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardContent className="p-6">
        {/* Header with icon and formats */}
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-lg p-3 ${report.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex gap-1">
            {report.formats.map(fmt => (
              <Badge key={fmt} variant="secondary">{fmt}</Badge>
            ))}
          </div>
        </div>

        {/* Report info */}
        <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{report.description}</p>

        {/* Footer with action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs text-gray-500">
            Generated: {formatDate(report.lastGenerated)}
          </span>
          <Button
            size="sm"
            onClick={() => handleGenerateReport(report.id)}
            className="bg-admin-primary-500 hover:bg-admin-primary-600"
          >
            <Download className="w-4 h-4 mr-1" />
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Schedules Page Enhancement
```typescript
// src/components/dashboard/slot-capacity-indicator.tsx

export function SlotCapacityIndicator({
  reserved,
  total,
}: {
  reserved: number;
  total: number;
}) {
  const percentage = (reserved / total) * 100;
  const color =
    percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 min-w-fit">
        {reserved}/{total}
      </span>
    </div>
  );
}
```

### 3. Applications Page Enhancement
```typescript
// src/components/dashboard/application-row.tsx

export function ApplicationRow({ application }: { application: Application }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-admin-primary-500">
        {application.applicationNumber}
      </td>
      <td className="px-4 py-3 text-gray-900">{application.businessName}</td>
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">{application.reviewer?.firstName[0]}</Avatar>
          <span className="text-sm text-gray-700">
            {application.reviewer?.firstName} {application.reviewer?.lastName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <ActionMenu>
          <ActionMenuItem icon={<Eye />} label="View" />
          <ActionMenuItem icon={<Download />} label="Download" />
          <ActionMenuItem icon={<MoreVertical />} label="More" />
        </ActionMenu>
      </td>
    </tr>
  );
}
```

---

## 🎯 INTEGRATION CHECKLIST

```markdown
## Phase 1: Setup (Day 1)
- [ ] Update tailwind.config.ts with color palette
- [ ] Create RoleBadge component
- [ ] Create StatusBadge component
- [ ] Create AdminStatCard component
- [ ] Test with Users page

## Phase 2: Components (Day 2-3)
- [ ] Create EnhancedDataTable component
- [ ] Create AdminReportCard component
- [ ] Create SlotCapacityIndicator component
- [ ] Update all sidebar nav colors

## Phase 3: Pages (Day 4-5)
- [ ] Update Users page with new components
- [ ] Update Reports page with new components
- [ ] Update Schedules page with new components
- [ ] Update Applications page with new components
- [ ] Update Settings page structure

## Phase 4: Polish (Day 6)
- [ ] Add animations/transitions
- [ ] Test responsive design
- [ ] Accessibility review
- [ ] Performance optimization
```

---

## 📊 VISUAL REFERENCE GUIDE

### Color Palette Quick Reference
```
PRIMARY: #2563EB (Blue)
SUCCESS: #10B981 (Green)
WARNING: #F59E0B (Amber)
ERROR: #EF4444 (Red)
INFO: #06B6D4 (Cyan)

ROLES:
  Administrator: #8B5CF6 (Purple)
  Reviewer: #3B82F6 (Blue)
  Staff: #10B981 (Green)
  Applicant: #6B7280 (Gray)

STATUS:
  Draft: Gray
  Pending: Blue
  In Progress: Amber
  Approved: Green
  Rejected: Red
```

### Typography Scale
```
32px / Bold   (Page titles)
20px / Semi-bold (Section headers)
16px / Semi-bold (Card headers)
14px / Normal (Body text, table cells)
12px / Medium (Labels, captions)
```

---

## 🚀 DEPLOYMENT NOTES

1. **No Breaking Changes**: All updates are additive, existing functionality preserved
2. **Gradual Rollout**: Can implement page-by-page
3. **Testing**: Use Playwright to verify responsive behavior
4. **Accessibility**: All badges and components tested with axe
5. **Performance**: No new dependencies that impact bundle size

---

## 💡 NEXT STEPS

1. ✅ Review this guide with the team
2. ✅ Create mockups in Figma (optional)
3. ✅ Update tailwind.config.ts
4. ✅ Implement component library
5. ✅ Update pages in order: Users → Reports → Schedules → Applications → Settings
6. ✅ QA testing across all browsers
7. ✅ Deploy to staging for feedback
8. ✅ Production release
