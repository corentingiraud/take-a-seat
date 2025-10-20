import { Metadata } from "next";
import { use } from "react";

import UserProfile from "./client";

export const metadata: Metadata = {
  title: "Profil utilisateur",
};

type Params = { id?: string | string[] };

export default function UserProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = use(params);
  const resolvedId = Array.isArray(id) ? id[0] : (id ?? null);

  return <UserProfile initialUserId={resolvedId} />;
}
