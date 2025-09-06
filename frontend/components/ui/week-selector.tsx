"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Moment } from "moment";

import { Button } from "@/components/ui/button";

type WeekSelectorProps = {
  label?: string;
  startDate: Moment;
  endDate: Moment;
  onChange?: (start: Moment, end: Moment) => void;
  compact?: boolean;
};

export const WeekSelector = ({
  label = "Semaine du",
  startDate,
  endDate,
  onChange,
  compact = false,
}: WeekSelectorProps) => {
  const goToPreviousWeek = () => {
    const newStart = startDate.clone().subtract(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    onChange?.(newStart, newEnd);
  };

  const goToNextWeek = () => {
    const newStart = startDate.clone().add(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    onChange?.(newStart, newEnd);
  };

  return (
    <div className="flex items-center justify-between">
      <Button size="icon" variant="ghost" onClick={goToPreviousWeek}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {!compact && (
        <p className="text-muted-foreground">
          {label} {startDate.format("D MMMM")} au{" "}
          {endDate.format("D MMMM YYYY")}
        </p>
      )}

      <Button size="icon" variant="ghost" onClick={goToNextWeek}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
