"use client";

import { useEffect, useState } from "react";

import { CoworkingSpace } from "@/models/coworking-space";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { CoworkingSpaceSelect } from "@/components/coworking-spaces/select";
import { Label } from "@/components/ui/label";

interface CalendarFilterProps {
  coworkingSpaceId: string;
  onChange: (coworkingSpaceId: string) => void;
}

export const CalendarFilter = ({
  coworkingSpaceId,
  onChange,
}: CalendarFilterProps) => {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const { fetchAll } = useStrapiAPI();

  useEffect(() => {
    fetchAll(CoworkingSpace.strapiAPIParams).then((data) => {
      setSpaces(data);

      // fall back to the first space when the URL carries no or an unknown id
      if (
        data.length > 0 &&
        !data.some((space) => space.documentId === coworkingSpaceId)
      ) {
        onChange(data[0].documentId);
      }
    });
  }, []);

  return (
    <div className="m-auto max-w-xl flex flex-col gap-4">
      <div>
        <Label>Espace de coworking</Label>
        <CoworkingSpaceSelect
          coworkingSpaces={spaces}
          value={spaces.find((space) => space.documentId === coworkingSpaceId)}
          onChange={(space) => {
            if (space) {
              onChange(space.documentId);
            }
          }}
        />
      </div>
    </div>
  );
};
