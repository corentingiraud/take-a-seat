"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoworkingSpace } from "@/models/coworking-space";

interface CoworkingSpaceSelectProps {
  coworkingSpaces: CoworkingSpace[];
  onChange: (coworkingSpace: CoworkingSpace | null) => void;
  value?: CoworkingSpace | null;
}

export const CoworkingSpaceSelect = ({
  coworkingSpaces,
  onChange,
  value,
}: CoworkingSpaceSelectProps) => {
  const handleChange = (val: string) => {
    const index = parseInt(val);

    onChange(coworkingSpaces[index]);
  };

  const selectedIndex = value
    ? coworkingSpaces.findIndex((s) => s.id === value.id)
    : undefined;

  return (
    <div>
      <Select
        required
        name="coworkingSpace"
        value={selectedIndex?.toString() || ""}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un espace" />
        </SelectTrigger>
        <SelectContent>
          {coworkingSpaces.map((space, index) => (
            <SelectItem key={space.id} value={index.toString()}>
              {space.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
