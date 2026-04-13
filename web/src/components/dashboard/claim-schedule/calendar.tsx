"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

interface CalendarComponentProps {
  blockedDates: BlockedDate[];
  onDateSelect: (date: Date) => void;
}

export function CalendarComponent({
  blockedDates,
  onDateSelect,
}: CalendarComponentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const blockedDateSet = new Set(blockedDates.map((d) => d.date));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{monthName}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const isBlocked = blockedDateSet.has(dateStr);
          const isToday = new Date().toDateString() === new Date(dateStr).toDateString();

          return (
            <button
              key={day}
              onClick={() => onDateSelect(new Date(dateStr))}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                isBlocked
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : isToday
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-50 text-gray-900 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="h-3 w-3 rounded bg-blue-100" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="h-3 w-3 rounded bg-red-100" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
