"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useUIStore } from "@/lib/stores";
import type { Role } from "@prisma/client";

interface ShellProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string | null;
    role: Role;
  };
<<<<<<< Updated upstream
=======
  userStatus?: string | null;
  isRenewalEligible?: boolean;
>>>>>>> Stashed changes
  children: React.ReactNode;
}

/**
 * DashboardShell — client wrapper that manages the mobile sidebar open state
 * and wires Zustand UI store for sidebar collapse + notifications.
 */
<<<<<<< Updated upstream
export function DashboardShell({ user, children }: ShellProps) {
=======
export function DashboardShell({
  user,
  userStatus,
  isRenewalEligible = false,
  children,
}: ShellProps) {
>>>>>>> Stashed changes
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  // Sync Zustand sidebar state with local mobile state on mount
  useEffect(() => {
    // ensure no SSR mismatch — runs only on client
  }, []);

<<<<<<< Updated upstream
=======
  // Select sidebar component based on user role
  const getSidebar = () => {
    const sidebarProps = {
      user,
      userStatus,
      isRenewalEligible,
      isOpen: sidebarOpen,
      onClose: () => setSidebarOpen(false),
      collapsed: sidebarCollapsed,
      onToggleCollapse: toggleSidebarCollapsed,
    };

    switch (user.role) {
      case "STAFF":
        return <StaffSidebar {...sidebarProps} />;
      case "REVIEWER":
        return <ReviewerSidebar {...sidebarProps} />;
      case "ADMINISTRATOR":
        return <AdminSidebar {...sidebarProps} />;
      case "APPLICANT":
      default:
        return <ApplicantSidebar {...sidebarProps} />;
    }
  };

>>>>>>> Stashed changes
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

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
