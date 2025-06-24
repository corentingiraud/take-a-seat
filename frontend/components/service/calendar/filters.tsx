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
  const { setService, service } = useServiceCalendar();
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CoworkingSpace | null>(
    null,
  );
  const [services, setServices] = useState<Service[]>([]);

  const { fetchAll } = useStrapiAPI();

  // Fetch coworking spaces on load
  useEffect(() => {
    fetchAll(CoworkingSpace.strapiAPIParams).then(setSpaces);
  }, []);

  // Fetch services when space changes
  useEffect(() => {
    if (!selectedSpace) {
      setServices([]);
      setService(null);

      return;
    }

    fetchAll<Service>({
      ...Service.strapiAPIParams,
      queryParams: {
        filters: {
          coworkingSpace: {
            id: {
              $eq: selectedSpace.id,
            },
          },
        },
      },
    }).then(setServices);
  }, [selectedSpace]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Espace de coworking</Label>
        <CoworkingSpaceSelect
          coworkingSpaces={spaces}
          value={selectedSpace ?? undefined}
          onChange={(space) => {
            setSelectedSpace(space);
            setService(null);
          }}
        />
      </div>

      {selectedSpace && (
        <div>
          <Label>Service</Label>
          <ServiceSelect
            services={services}
            value={service}
            onChange={setService}
          />
        </div>
      )}
      <Button
        variant="outline"
        onClick={() => {
          setService(null);
          setSelectedSpace(null);
          setServices([]);
        }}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
};
