"use client";

import { useEffect, useState } from "react";

import { useAdminBookings } from "@/contexts/admin/bookings";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { User } from "@/models/user";
import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CoworkingSpaceSelect } from "@/components/coworking-spaces/select";
import { ServiceSelect } from "@/components/services/select";
import { UserSelect } from "@/components/users/select";

export const AdminBookingsFilters = () => {
  const {
    userFilter,
    coworkingSpaceFilter,
    serviceFilter,
    setUserFilter,
    setCoworkingSpaceFilter,
    setServiceFilter,
    reload,
  } = useAdminBookings();

  const { fetchAll } = useStrapiAPI();
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Initial fetch
  useEffect(() => {
    fetchAll<User>({ ...User.strapiAPIParams }).then(setUsers);
    fetchAll<CoworkingSpace>({ ...CoworkingSpace.strapiAPIParams }).then(
      setSpaces,
    );
  }, []);

  // Fetch services dynamically when coworking space is selected
  useEffect(() => {
    if (!coworkingSpaceFilter) {
      setServices([]);

      return;
    }

    fetchAll<Service>({
      ...Service.strapiAPIParams,
      queryParams: {
        filters: {
          coworkingSpace: {
            id: {
              $eq: coworkingSpaceFilter.id,
            },
          },
        },
      },
    }).then(setServices);
  }, [coworkingSpaceFilter]);

  const resetFilters = () => {
    setUserFilter(null);
    setCoworkingSpaceFilter(null);
    setServiceFilter(null);
    reload();
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Espace</Label>
        <CoworkingSpaceSelect
          coworkingSpaces={spaces}
          value={coworkingSpaceFilter ?? undefined}
          onChange={(space) => {
            setCoworkingSpaceFilter(space);
            setServiceFilter(null);
          }}
        />
      </div>

      {coworkingSpaceFilter && (
        <div>
          <Label>Service</Label>
          <ServiceSelect
            services={services}
            value={serviceFilter ?? undefined}
            onChange={setServiceFilter}
          />
        </div>
      )}

      <div>
        <Label>Utilisateur</Label>
        <UserSelect
          users={users}
          value={userFilter ?? undefined}
          onChange={setUserFilter}
        />
      </div>

      <Button variant="outline" onClick={resetFilters}>
        Réinitialiser les filtres
      </Button>
    </div>
  );
};
