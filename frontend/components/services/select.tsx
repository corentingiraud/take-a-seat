"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@/models/service";

interface ServiceSelectProps {
  services: Service[];
  onChange: (service: Service | null) => void;
  value?: Service | null;
}

export const ServiceSelect = ({
  services,
  onChange,
  value,
}: ServiceSelectProps) => {
  const handleChange = (val: string) => {
    const index = parseInt(val);

    onChange(services[index]);
  };

  const selectedIndex = value
    ? services.findIndex((s) => s.id === value.id)
    : null;

  return (
    <Select
      required
      name="service"
      value={selectedIndex?.toString() || ""}
      onValueChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner un service" />
      </SelectTrigger>
      <SelectContent>
        {services.map((service, index) => (
          <SelectItem key={service.id} value={index.toString()}>
            {service.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
