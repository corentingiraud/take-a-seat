"use client";

import { useMemo } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_DURATION, DurationWrapper } from "@/models/duration";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Service } from "@/models/service";

interface DurationFormStepProps {
  service: Service;
  onDurationChange: (duration: DurationWrapper | undefined) => void;
}

export const DurationFormStep = ({
  service,
  onDurationChange,
}: DurationFormStepProps) => {
  const availableDuration = useMemo(() => {
    const base = {
      HALF_DAY: AVAILABLE_DURATION.HALF_DAY,
      RANGE_OF_DATES: AVAILABLE_DURATION.RANGE_OF_DATES,
      MULTIPLE_DATES: AVAILABLE_DURATION.MULTIPLE_DATES,
    } as const;

    if (service?.bookingDuration === 30) {
      return { HALF_HOUR: AVAILABLE_DURATION.HALF_HOUR, ...base };
    }

    if (service?.bookingDuration === 60) {
      return { ONE_HOUR: AVAILABLE_DURATION.ONE_HOUR, ...base };
    }

    return base;
  }, [service?.bookingDuration]);

  const onValueChange = (value: string) => {
    onDurationChange(
      AVAILABLE_DURATION[value as keyof typeof AVAILABLE_DURATION],
    );
  };

  return (
    <div>
      <Label htmlFor="duration">Pour combien de temps ?</Label>
      <Select required name="duration" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une durée" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(availableDuration).map((entry) => (
            <SelectItem key={entry[0]} value={entry[0]}>
              {capitalizeFirstLetter(entry[1].humanize())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
