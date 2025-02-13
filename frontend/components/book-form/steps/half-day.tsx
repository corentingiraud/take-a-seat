"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HalfDay } from "@/models/half-day";

interface HalfDayFormStepProps {
  onHalfDayChange: (halfDay: HalfDay) => void;
}

export const HalfDayFormStep = ({ onHalfDayChange }: HalfDayFormStepProps) => {
  const onValueChange = (value: string) => {
    onHalfDayChange((HalfDay as any)[value]);
  };

  return (
    <div>
      <Label htmlFor="duration">Matinée ou après-midi ?</Label>
      <Select required name="duration" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une valeur" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(HalfDay).map((halfDay) => (
            <SelectItem key={halfDay} value={halfDay}>
              {(HalfDay as any)[halfDay]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
