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
import { useFetchContentType } from "@/hooks/use-fetch-content-type";
import { Service } from "@/models/service";
import { CoworkingSpace } from "@/models/coworking-space";

interface ServiceFormStepProps {
  coworkingSpace: CoworkingSpace;
  onServiceChange: (service: Service) => void;
}

export const ServiceFormStep = ({
  coworkingSpace,
  onServiceChange,
}: ServiceFormStepProps) => {
  const [services, setServices] = useState<Service[]>([]);

  const { fetchAll } = useFetchContentType();

  useEffect(() => {
    fetchAll<Service>({
      ...Service.fetchParams,
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
      setServices(services);
    });
  }, [coworkingSpace]);

  const onValueChange = (i: string) => {
    onServiceChange(services[parseInt(i)]);
  };

  return (
    <div>
      <Label htmlFor="service">Quoi ?</Label>
      <Select required name="service" onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un service" />
        </SelectTrigger>
        <SelectContent>
          {services.map((service, i) => (
            <SelectItem key={i} value={i.toString()}>
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
