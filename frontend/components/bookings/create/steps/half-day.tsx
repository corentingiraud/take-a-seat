import { Moment } from "moment";

import { isHalfDayAvailable } from "./utils/is-half-day-available";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HalfDay } from "@/models/half-day";
import { Unavailability } from "@/models/unavailability";
import { Time } from "@/models/time";

interface HalfDayFormStepProps {
  onHalfDayChange: (halfDay: HalfDay) => void;
  date: Moment;
  unavailabilities: Unavailability[];
  openingTime: Time;
  closingTime: Time;
}

export const HalfDayFormStep = ({
  onHalfDayChange,
  date,
  unavailabilities,
  openingTime,
  closingTime,
}: HalfDayFormStepProps) => {
  const options = Object.values(HalfDay).filter((halfDay) =>
    isHalfDayAvailable(
      date,
      halfDay,
      unavailabilities,
      openingTime,
      closingTime,
    ),
  );

  return (
    <div className="mt-4">
      <Label htmlFor="duration">Matinée ou après-midi ?</Label>
      <Select
        required
        name="duration"
        onValueChange={(v) =>
          onHalfDayChange(HalfDay[v as keyof typeof HalfDay])
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une valeur" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(HalfDay)
            .filter(([_, label]) => options.includes(label as HalfDay))
            .map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
