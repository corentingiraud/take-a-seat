"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

import { useAuth } from "@/contexts/auth-context";
import { RoleType } from "@/models/role";
import { siteConfig } from "@/config/site";

export const AuthMenu = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button
        variant="default"
        onClick={() => router.push(siteConfig.path.login.href)}
      >
        Se connecter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {user?.firstName} {user?.lastName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem
          className="font-semibold text-primary hover:bg-primary/10"
          onClick={() => router.push(siteConfig.path.book.href)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Réserver un créneau
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(siteConfig.path.serviceCalendar.href)}
        >
          Calendrier des services
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(siteConfig.path.dashboard.href)}
        >
          Tableau de bord
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(siteConfig.path.myInformation.href)}
        >
          Mes informations
        </DropdownMenuItem>

        {hasRole(RoleType.SUPER_ADMIN) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground">
              Admin
            </DropdownMenuLabel>
            {/* <DropdownMenuItem
              onClick={() => router.push(siteConfig.path.adminBookings.href)}
            >
              Gérer les réservations
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => router.push(siteConfig.path.adminPayments.href)}
            >
              Gérer les payements
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(siteConfig.path.adminPrepaidCardsNew.href)
              }
            >
              Créer des cartes prépayées
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(siteConfig.path.strapiAdmin.href, "_blank")
              }
            >
              Accéder à la console Strapi
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            router.push(siteConfig.path.login.href);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
