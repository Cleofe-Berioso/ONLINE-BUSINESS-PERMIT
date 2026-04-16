"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  History,
  CalendarCheck,
  File,
  Bell,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RenewalSidebarProps {
  user: {
    firstName: string;
    lastName: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function RenewalSidebar({
  user,
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: RenewalSidebarProps) {
  const pathname = usePathname();

  const mainNav: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard/renew",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Renew Permit",
      href: "/dashboard/renew/permit",
      icon: <RefreshCw className="h-5 w-5" />,
    },
    {
      label: "Renewal History",
      href: "/dashboard/renew/history",
      icon: <History className="h-5 w-5" />,
    },
    {
      label: "Claim Schedule",
      href: "/dashboard/renew/claim-schedule",
      icon: <CalendarCheck className="h-5 w-5" />,
    },
  ];

  const accountNav: NavItem[] = [
    {
      label: "Documents",
      href: "/dashboard/renew/documents",
      icon: <File className="h-5 w-5" />,
    },
    {
      label: "Notifications",
      href: "/dashboard/renew/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      label: "Profile",
      href: "/dashboard/renew/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const NavGroup = ({
    label,
    items,
  }: {
    label: string;
    items: NavItem[];
  }) => (
    <div className="mb-4">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/renew" && pathname.startsWith(item.href));

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
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon}
                {!collapsed && item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#1a2035]">
      {/* Header with user info */}
      <div
        className={cn(
          "flex items-center border-b border-white/10 py-4",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] leading-tight text-gray-400">
                Renewal Portal
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            title={`${user.firstName} ${user.lastName}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white"
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        )}

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Desktop collapse button */}
        {onToggleCollapse && !onClose && (
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-white/10 lg:block"
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
        <NavGroup label="Main" items={mainNav} />
        <NavGroup label="Account" items={accountNav} />
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-shrink-0 border-r border-white/10 bg-[#1a2035] transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 bg-[#1a2035] shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
