import { Metadata } from "next";

import UserProfile from "./client";

export const metadata: Metadata = {
  title: "Profil utilisateur",
};

type Params = { id?: string | string[] };

export default function UserProfilePage({ params }: { params: Params }) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <UserProfile initialUserId={id ?? null} />;
}
