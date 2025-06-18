"use client";

import { useEffect, useState } from "react";

import { CoworkingSpaceSelect } from "@/components/coworking-spaces/select";
import { CoworkingSpace } from "@/models/coworking-space";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Label } from "@/components/ui/label";

interface CoworkingSpaceFormStepProps {
  value?: CoworkingSpace | null;
  onCoworkingSpaceChange: (coworkingSpace: CoworkingSpace | null) => void;
}

export const CoworkingSpaceFormStep = ({
  value,
  onCoworkingSpaceChange,
}: CoworkingSpaceFormStepProps) => {
  const [coworkingSpaces, setCoworkingSpaces] = useState<CoworkingSpace[]>([]);
  const { fetchAll } = useStrapiAPI();

  useEffect(() => {
    fetchAll<CoworkingSpace>({
      ...CoworkingSpace.strapiAPIParams,
      queryParams: {
        populate: ["unavailabilities"],
      },
    }).then(setCoworkingSpaces);
  }, []);

  return (
    <div>
      <Label htmlFor="coworkingSpace">Où ?</Label>
      <CoworkingSpaceSelect
        coworkingSpaces={coworkingSpaces}
        value={value}
        onChange={onCoworkingSpaceChange}
      />
    </div>
  );
};
