"use client";

import { useEffect, useState } from "react";

import { ServiceSelect } from "@/components/service/select";
import { Label } from "@/components/ui/label";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Service } from "@/models/service";
import { CoworkingSpace } from "@/models/coworking-space";

interface ServiceFormStepProps {
  value?: Service | null;
  coworkingSpace: CoworkingSpace;
  onServiceChange: (service: Service | null) => void;
}

export const ServiceFormStep = ({
  value,
  coworkingSpace,
  onServiceChange,
}: ServiceFormStepProps) => {
  const [services, setServices] = useState<Service[]>([]);

  const { fetchAll } = useStrapiAPI();

  useEffect(() => {
    fetchAll<Service>({
      ...Service.strapiAPIParams,
      queryParams: {
        filters: {
          coworkingSpace: {
            id: {
              $eq: coworkingSpace.id,
            },
          },
        },
      },
    }).then((services) => {
      services.forEach((service) => {
        service.coworkingSpace = coworkingSpace;
      });
      setServices(services);
    });
  }, [coworkingSpace]);

  return (
    <div>
      <Label htmlFor="service">Quoi ?</Label>
      <ServiceSelect
        services={services}
        value={value}
        onChange={onServiceChange}
      />
    </div>
  );
};
