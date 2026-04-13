"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

interface BlockedDatesListProps {
  blockedDates: BlockedDate[];
  onRemove: (id: string) => void;
  isLoading?: boolean;
}

export function BlockedDatesList({
  blockedDates,
  onRemove,
  isLoading = false,
}: BlockedDatesListProps) {
  if (blockedDates.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-500">No blocked dates yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {blockedDates.map((blockedDate) => {
        const date = new Date(blockedDate.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={blockedDate.id}
            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{formattedDate}</p>
              <p className="text-sm text-gray-600">{blockedDate.reason}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(blockedDate.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              Remove
            </Button>
          </div>
        );
      })}
    </div>
  );
}
