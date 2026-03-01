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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface SidebarProps {
  user: {
    role: Role;
    firstName: string;
    lastName: string;
  };
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
  },
  {
    label: "System Settings",
    href: "/dashboard/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["ADMINISTRATOR"],
  },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b px-6 py-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">Business Permit</h1>
            <p className="text-xs text-gray-500">System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
