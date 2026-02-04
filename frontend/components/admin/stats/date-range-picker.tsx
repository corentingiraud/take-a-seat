"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";

interface MonthPickerProps {
  month: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthPicker({ month, onMonthChange }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(subMonths(month, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-[160px] text-center text-sm font-medium capitalize">
        {format(month, "MMMM yyyy", { locale: fr })}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onMonthChange(addMonths(month, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
