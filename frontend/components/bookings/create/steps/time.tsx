"use client";
import { Moment } from "moment";
import { useState } from "react";
import { X } from "lucide-react";

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
  date: Moment;
  onTimeChange: (times: Time[]) => void;
}

export const TimeFormStep = ({
  service,
  date,
  onTimeChange,
}: TimeFormStepProps) => {
  const [selectedTimes, setSelectedTimes] = useState<Time[]>([]);

  const isTimeAvailable = (time: Time) => {
    const start = date.clone().hour(time.hour).minute(time.minute);

    return !service.coworkingSpace?.unavailabilities.some((u) => u.contains(start));
  };

  const handleTimeSelect = (value: string) => {
    const newTime = Time.fromString(value);
    const isAlreadySelected = selectedTimes.some(
      (time) => time.toString() === newTime.toString(),
    );

    if (!isAlreadySelected) {
      const updatedTimes = [...selectedTimes, newTime].sort((a, b) => {
        const timeA = a.toString();
        const timeB = b.toString();

        return timeA.localeCompare(timeB);
      });

      setSelectedTimes(updatedTimes);
      onTimeChange(updatedTimes);
    }
  };

  const handleTimeRemove = (timeToRemove: Time) => {
    const updatedTimes = selectedTimes.filter(
      (time) => time.toString() !== timeToRemove.toString(),
    );

    setSelectedTimes(updatedTimes);
    onTimeChange(updatedTimes);
  };

  const availableTimeSlots = service.getTimeSlot(date);

  const filteredSlots = availableTimeSlots.filter(isTimeAvailable);

  const selectableTimeSlots = filteredSlots.filter(
    (timeSlot) =>
      !selectedTimes.some(
        (selected) => selected.toString() === timeSlot.toString(),
      ),
  );

  return (
    <div className="space-y-4">
      <Label className="text-foreground dark:text-foreground" htmlFor="service">
        Quel(s) créneau(x) ?
      </Label>

      {/* Display selected times */}
      {selectedTimes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTimes.map((time, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
            >
              <span>
                {time.toString()}
                {" => "}
                {time.addMinutes(service.bookingDuration).toString()}
              </span>
              <button
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                type="button"
                onClick={() => handleTimeRemove(time)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Time selector */}
      <Select
        name="service"
        value="" // Keep empty to allow multiple selections
        onValueChange={handleTimeSelect}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={
              selectedTimes.length > 0
                ? `${selectedTimes.length} créneau(x) sélectionné(s)`
                : "Sélectionner un ou plusieurs créneaux"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {selectableTimeSlots.length > 0 ? (
            selectableTimeSlots.map((timeSlot, i) => (
              <SelectItem key={i} value={timeSlot.toString()}>
                {timeSlot.toString()}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="no-times-available">
              Toutes les créneaux sont sélectionnés
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
