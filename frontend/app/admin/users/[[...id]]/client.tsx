"use client";

import { useEffect, useState } from "react";

import { User } from "@/models/user";
import { generateDynamicPageTitle } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components/ui/section";
import { UserDetails } from "@/components/users/details";
import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";
import { BookingsList } from "@/components/bookings/list/list";
import { UserSelect } from "@/components/users/select";
import { useStrapiAPI } from "@/hooks/use-strapi-api";

type Props = { initialUserId?: string | null };

export default function UserProfile({ initialUserId = null }: Props) {
  const { fetchAll } = useStrapiAPI();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchAll<User>({ ...User.strapiAPIParams })
      .then(setUsers)
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    if (!initialUserId || users.length === 0) return;

    const match =
      users.find((u) => String(u.id) === String(initialUserId)) || null;

    setSelectedUser(match);
  }, [initialUserId, users]);

  useEffect(() => {
    if (!selectedUser?.id) return;

    const url = new URL(window.location.href);
    const pathname = url.pathname;

    const hasTrailingId = /\/\d+$/.test(pathname);
    const nextPath = hasTrailingId
      ? pathname.replace(/\/\d+$/, `/${selectedUser.id}`)
      : `${pathname.replace(/\/$/, "")}/${selectedUser.id}`;

    if (nextPath !== pathname) {
      url.pathname = nextPath;
      window.history.replaceState(null, "", url.toString());
    }
  }, [selectedUser?.id]);

  if (loadingUsers) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const noUsers = users.length === 0;
  const urlIdNotFound =
    initialUserId &&
    !selectedUser &&
    users.every((u) => String(u.id) !== String(initialUserId));

  return (
    <div className="space-y-6">
      <div className="w-full">
        <UserSelect
          users={users}
          value={selectedUser}
          onChange={setSelectedUser}
        />
      </div>

      <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 border-b pb-2">
        {selectedUser
          ? `${selectedUser.firstName} ${selectedUser.lastName}`
          : noUsers
            ? "Aucun utilisateur disponible"
            : "Sélectionner un utilisateur"}
      </h3>

      {!selectedUser && !noUsers && !urlIdNotFound && (
        <div className="rounded-md border p-6 text-muted-foreground">
          Choisissez un utilisateur pour afficher son profil.
        </div>
      )}

      {urlIdNotFound && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
          L&apos;utilisateur demandé est introuvable. Sélectionnez un
          utilisateur dans la liste.
        </div>
      )}

      {noUsers && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-6 text-blue-800">
          Aucun utilisateur trouvé.
        </div>
      )}

      {selectedUser && (
        <>
          <Section title="Informations">
            <UserDetails user={selectedUser} />
          </Section>

          <Section title="Cartes prépayées">
            <PrepaidCardsList user={selectedUser} />
          </Section>

          <Section title="Réservations">
            <BookingsList user={selectedUser} />
          </Section>
        </>
      )}
    </div>
  );
}
