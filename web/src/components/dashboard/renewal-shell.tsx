"use client";

import { useState, useEffect } from "react";
import { RenewalSidebar } from "@/components/dashboard/renewal-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useUIStore } from "@/lib/stores";
import type { User } from "next-auth";

interface RenewalShellProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string | null;
    role: User["role"];
  };
  children: React.ReactNode;
}

/**
 * RenewalShell — Client wrapper that manages mobile sidebar state
 * and wires Zustand UI store for sidebar collapse.
 * Same pattern as DashboardShell but for renewal portal.
 */
export function RenewalShell({ user, children }: RenewalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  // Sync Zustand sidebar state with local mobile state on mount
  useEffect(() => {
    // ensure no SSR mismatch — runs only on client
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Renewal Portal Sidebar */}
      <RenewalSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
