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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RenewalSidebarProps {
  user?: {
    firstName: string;
    lastName: string;
  };
}

export function RenewalSidebar({ user }: RenewalSidebarProps) {
  const pathname = usePathname();

  const navItems = [
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

  return (
    <aside className="w-56 flex-shrink-0 border-r border-white/10 bg-[#1a2035]">
      <div className="flex h-full flex-col">
        {/* Renewal Portal Header */}
        <div className="border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white">
            Renewal Portal
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard/renew" &&
                  pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
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
      </div>
    </aside>
  );
}
