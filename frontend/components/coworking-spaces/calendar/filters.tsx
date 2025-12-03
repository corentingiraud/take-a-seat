"use client";

import { useEffect, useState } from "react";

import { CoworkingSpace } from "@/models/coworking-space";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { CoworkingSpaceSelect } from "@/components/coworking-spaces/select";
import { Label } from "@/components/ui/label";

interface CalendarFilterProps {
  coworkingSpace?: CoworkingSpace;
  onChange: (coworkingSpace: CoworkingSpace) => void;
}

export const CalendarFilter = ({ coworkingSpace, onChange }: CalendarFilterProps) => {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const { fetchAll } = useStrapiAPI();

  useEffect(() => {
    fetchAll(CoworkingSpace.strapiAPIParams).then((data) => {
      setSpaces(data);

      // sélectionne le premier si rien n'est choisi
      if (!coworkingSpace && data.length > 0) {
        onChange(data[0]);
      }
    });
  }, []);

  return (
    <div className="m-auto max-w-xl flex flex-col gap-4">
      <div>
        <Label>Espace de coworking</Label>
        <CoworkingSpaceSelect
          coworkingSpaces={spaces}
          value={coworkingSpace}
          onChange={(space) => {
            if (space) {
              onChange(space);
            }
          }}
        />
      </div>
    </div>
  );
};
