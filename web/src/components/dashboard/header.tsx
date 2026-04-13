"use client";

import { useState } from "react";
import { LogOut, Menu, User, ChevronDown } from "lucide-react";
import type { Role } from "@prisma/client";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { logoutAction } from "@/app/actions/logout";

interface HeaderProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string | null;
    role: Role;
  };
  /** Called when the hamburger button is pressed on mobile */
  onMenuClick?: () => void;
}

export function DashboardHeader({ user, onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call server action that clears session and logs activity
      // The server action will handle the redirect internally
      // If signOut() throws NEXT_REDIRECT, it will trigger navigation
      await logoutAction();
      // If we reach here without redirect, manually redirect as fallback
      window.location.href = "/login";
    } catch (error: unknown) {
      // Server actions may throw redirect errors which is expected behavior
      // Just log any unexpected errors
      if (error instanceof Error) {
        console.error("Logout error:", error.message);
      }
      // Always redirect to login as fallback
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — visible only on mobile */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg lg:hidden">
          Business Permit System
        </h2>
      </div>      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications — live bell with SSE */}
        <NotificationBell />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-100 sm:px-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
          </button>

          {showUserMenu && (
            <>
              {/* Click-away backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-white py-2 shadow-lg">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </a>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
