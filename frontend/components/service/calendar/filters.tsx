"use client";

import { useEffect, useState } from "react";

import { useServiceCalendar } from "@/contexts/service-calendar-context";
import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { CoworkingSpaceSelect } from "@/components/coworking-spaces/select";
import { ServiceSelect } from "@/components/service/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const ServiceCalendarFilter = () => {
  const { service, coworkingSpace, setService, setCoworkingSpace } =
    useServiceCalendar();

  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const { fetchAll } = useStrapiAPI();

  // Fetch coworking spaces on load
  useEffect(() => {
    fetchAll(CoworkingSpace.strapiAPIParams).then(setSpaces);
  }, []);

  // Fetch services when coworking space changes
  useEffect(() => {
    if (!coworkingSpace) {
      setServices([]);
      setService(null);

      return;
    }

    fetchAll<Service>({
      ...Service.strapiAPIParams,
      queryParams: {
        populate: ["availabilities"],
        filters: {
          coworkingSpace: {
            id: {
              $eq: coworkingSpace.id,
            },
          },
        },
      },
    }).then(setServices);
  }, [coworkingSpace]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Espace de coworking</Label>
        <CoworkingSpaceSelect
          coworkingSpaces={spaces}
          value={coworkingSpace ?? undefined}
          onChange={(space) => {
            setCoworkingSpace(space);
            setService(null);
          }}
        />
      </div>

      {coworkingSpace && (
        <div>
          <Label>Service</Label>
          <ServiceSelect
            services={services}
            value={service}
            onChange={setService}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setCoworkingSpace(null);
            setService(null);
            setServices([]);
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
};
