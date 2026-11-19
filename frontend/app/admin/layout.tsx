"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";

// Single guard for every /admin/* page. Renders nothing until the user is
// resolved and confirmed super admin, so there is no flash of admin UI.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(siteConfig.path.login.href);
    else if (!isSuperAdmin) router.replace(siteConfig.path.dashboard.href);
  }, [loading, user, isSuperAdmin, router]);

  return !loading && user && isSuperAdmin ? <>{children}</> : null;
}
