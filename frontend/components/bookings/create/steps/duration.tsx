"use client";

import { Duration } from "moment";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_DURATION } from "@/models/duration";
import { capitalizeFirstLetter } from "@/lib/utils";

interface DurationFormStepProps {
  onDurationChange: (duration: Duration | null) => void;
}

export const DurationFormStep = ({
  onDurationChange,
}: DurationFormStepProps) => {
  const onValueChange = (value: string) => {
    onDurationChange(
      AVAILABLE_DURATION[
        value as keyof typeof AVAILABLE_DURATION
      ].getDuration(),
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
          {Object.entries(AVAILABLE_DURATION).map((entry) => (
            <SelectItem key={entry[0]} value={entry[0]}>
              {capitalizeFirstLetter(entry[1].humanize())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
