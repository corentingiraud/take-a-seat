"use client";

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

interface DurationFormStepProps {
  onDurationChange: (duration: DurationWrapper | undefined) => void;
}

export const DurationFormStep = ({
  onDurationChange,
}: DurationFormStepProps) => {
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
