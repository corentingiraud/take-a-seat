"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoworkingSpace } from "@/models/coworking-space";
import { useStrapiAPI } from "@/hooks/use-strapi-api";

interface CoworkingSpaceFormStepProps {
  onCoworkingSpaceChange: (coworkingSpace: CoworkingSpace) => void;
}

export const CoworkingSpaceFormStep = ({
  onCoworkingSpaceChange,
}: CoworkingSpaceFormStepProps) => {
  const [coworkingSpaces, setCoworkingSpaces] = useState<CoworkingSpace[]>([]);
  const { fetchAll } = useStrapiAPI();

  useEffect(() => {
    fetchAll<CoworkingSpace>(CoworkingSpace.fetchParams).then(
      (coworkingSpaces) => {
        setCoworkingSpaces(coworkingSpaces);
      },
    );
  }, []);

  const onValueChange = (i: string) => {
    onCoworkingSpaceChange(coworkingSpaces[parseInt(i)]);
  };

  return (
    <div>
      <Label htmlFor="coworkingSpace">Où ?</Label>
      <Select required name="coworkingSpace" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un espace" />
        </SelectTrigger>
        <SelectContent>
          {coworkingSpaces.map((space, i) => (
            <SelectItem key={i} value={i.toString()}>
              {space.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
