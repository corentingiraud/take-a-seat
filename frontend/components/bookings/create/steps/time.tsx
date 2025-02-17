"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@/models/service";
import { Time } from "@/models/time";

interface TimeFormStepProps {
  service: Service;
  onTimeChange: (time: Time) => void;
}

export const TimeFormStep = ({ service, onTimeChange }: TimeFormStepProps) => {
  return (
    <div>
      <Label htmlFor="service">A quelle heure ?</Label>
      <Select
        required
        name="service"
        onValueChange={(value) => onTimeChange(Time.fromString(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une heure" />
        </SelectTrigger>
        <SelectContent>
          {service.getTimeSlot().map((timeSlot, i) => (
            <SelectItem key={i} value={timeSlot.toString()}>
              {timeSlot.toString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
