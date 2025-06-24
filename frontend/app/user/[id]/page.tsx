import { Metadata } from "next";

import UserProfile from "./client";

export const metadata: Metadata = {
  title: "Profil utilisateur",
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UserProfile userId={id} />;
}
