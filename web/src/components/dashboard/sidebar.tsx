"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CalendarCheck,
  Upload,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Shield,
  Printer,
  Tag,
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface SidebarProps {
  user: {
    role: Role;
    firstName: string;
    lastName: string;
  };
  /** Mobile drawer: whether the sidebar is open */
  isOpen?: boolean;
  /** Mobile drawer: callback to close the sidebar */
  onClose?: () => void;
  /** Desktop: whether the sidebar is in collapsed (icon-only) mode */
  collapsed?: boolean;
  /** Desktop: callback to toggle collapsed state */
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["APPLICANT", "STAFF", "REVIEWER", "ADMINISTRATOR"],
  },
  // Applicant
  {
    label: "My Applications",
    href: "/dashboard/applications",
    icon: <FileText className="h-5 w-5" />,
    roles: ["APPLICANT"],
  },
  {
    label: "Track Status",
    href: "/dashboard/tracking",
    icon: <Clock className="h-5 w-5" />,
    roles: ["APPLICANT"],
  },
  {
    label: "My Documents",
    href: "/dashboard/documents",
    icon: <Upload className="h-5 w-5" />,
    roles: ["APPLICANT"],
  },
  {
    label: "Schedule Claiming",
    href: "/dashboard/schedule",
    icon: <CalendarCheck className="h-5 w-5" />,
    roles: ["APPLICANT"],
  },
  {
    label: "Claim Reference",
    href: "/dashboard/claim-reference",
    icon: <Tag className="h-5 w-5" />,
    roles: ["APPLICANT"],
  },
  // Staff & Reviewer
  {
    label: "Review Applications",
    href: "/dashboard/review",
    icon: <CheckSquare className="h-5 w-5" />,
    roles: ["STAFF", "REVIEWER", "ADMINISTRATOR"],
  },
  {
    label: "Verify Documents",
    href: "/dashboard/verify-documents",
    icon: <Upload className="h-5 w-5" />,
    roles: ["STAFF", "REVIEWER"],
  },
  {
    label: "Claims Processing",
    href: "/dashboard/claims",
    icon: <Tag className="h-5 w-5" />,
    roles: ["STAFF", "ADMINISTRATOR"],
  },
  {
    label: "Permit Issuance",
    href: "/dashboard/issuance",
    icon: <Printer className="h-5 w-5" />,
    roles: ["STAFF", "ADMINISTRATOR"],
  },
  // Admin
  {
    label: "Manage Users",
    href: "/dashboard/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },
  {
    label: "Manage Schedules",
    href: "/dashboard/admin/schedules",
    icon: <CalendarCheck className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },  {
    label: "System Settings",
    href: "/dashboard/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/admin/audit-logs",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },
];

function SidebarContent({
  user,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  user: SidebarProps["user"];
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-gray-200 dark:border-gray-700 py-4",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Shield className="h-8 w-8 flex-shrink-0 text-blue-600" />
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100">Business Permit</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">System</p>
            </div>
          )}
        </div>
        {/* Close button — only shown in mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Collapse toggle — only on desktop */}
        {onToggleCollapse && !onClose && (
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  )}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-4 flex justify-center">
          <div
            title={`${user.firstName} ${user.lastName}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar({ user, isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar (always visible on lg+) ── */}
      <aside
        className={cn(
          "hidden flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent user={user} collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 border-r border-gray-200 bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent user={user} onClose={onClose} />
      </aside>
    </>
  );
}
