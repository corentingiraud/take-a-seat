"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import moment, { Moment } from "moment";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type WeekSelectorProps = {
  label?: string;
  onWeekChange?: (startDate: Moment, endDate: Moment) => void;
  initialStartDate?: Moment;
};

export const WeekSelector = ({
  label = "Semaine du",
  onWeekChange,
  initialStartDate,
}: WeekSelectorProps) => {
  const [startDate, setStartDate] = useState<Moment>(
    (initialStartDate ?? moment()).clone().startOf("isoWeek"),
  );
  const [endDate, setEndDate] = useState<Moment>(
    (initialStartDate ?? moment()).clone().endOf("isoWeek"),
  );

  const goToPreviousWeek = () => {
    const newStart = startDate.clone().subtract(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const goToNextWeek = () => {
    const newStart = startDate.clone().add(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  useEffect(() => {
    onWeekChange?.(startDate, endDate);
  }, [startDate, endDate, onWeekChange]);

  return (
    <div className="flex items-center justify-between">
      <Button size="icon" variant="ghost" onClick={goToPreviousWeek}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <p className="text-muted-foreground">
        {label} {startDate.format("D MMMM")} au {endDate.format("D MMMM YYYY")}
      </p>

      <Button size="icon" variant="ghost" onClick={goToNextWeek}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
