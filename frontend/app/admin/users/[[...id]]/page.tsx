import { Metadata } from "next";

import UserProfile from "./client";

export const metadata: Metadata = {
  title: "Profil utilisateur",
};

type Params = Promise<{ id?: string[] }>;

export default async function UserProfilePage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const id = Array.isArray(resolvedParams.id)
    ? resolvedParams.id[0]
    : undefined;

  return <UserProfile initialUserId={id ?? null} />;
}
