"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Application Approved",
    message: "Your business permit application APP-2024-00123 has been approved. You can now claim your permit.",
    date: "Mar 13, 2026",
    isRead: false,
  },
  {
    id: "2",
    type: "info",
    title: "Document Verification",
    message: "Your DTI Certificate has been verified and approved by the BPLO officer.",
    date: "Mar 12, 2026",
    isRead: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Missing Document",
    message: "Please upload your Barangay Clearance to complete your application APP-2024-00123.",
    date: "Mar 11, 2026",
    isRead: true,
  },
  {
    id: "4",
    type: "info",
    title: "Application Received",
    message: "We have received your permit application. Reference number: APP-2024-00123",
    date: "Mar 10, 2026",
    isRead: true,
  },
  {
    id: "5",
    type: "success",
    title: "Payment Confirmed",
    message: "Your payment of ₱6,000.00 for business permit has been confirmed.",
    date: "Mar 05, 2026",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(
    MOCK_NOTIFICATIONS
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([]);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-4 border-l-green-500";
      case "warning":
        return "border-l-4 border-l-orange-500";
      case "info":
      default:
        return "border-l-4 border-l-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Stay updated with your application status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Unread Count Alert */}
      {unreadCount > 0 && (
        <Alert variant="info" className="flex items-center gap-3 bg-blue-50 border-blue-200">
          <Bell className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="text-sm text-blue-900">
            You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? "s" : ""}
          </span>
        </Alert>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">
            No notifications yet. You'll see updates about your applications here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">All Notifications</h2>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors ${
                  !notification.isRead ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                } ${getBorderColor(notification.type)}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <Badge variant="primary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                </div>

                {/* Date and Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {notification.date}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
