"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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

export const AuthMenu = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button variant="default" onClick={() => router.push("/")}>
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
        <DropdownMenuItem onClick={() => router.push("/my-information")}>
          Mes informations
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/my-bookings")}>
          Mes réservations
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/my-prepaid-cards")}>
          Mes cartes pré-payées
        </DropdownMenuItem>
        {/* Admin Section */}
        {hasRole(RoleType.SUPER_ADMIN) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground">
              Admin
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/admin/bookings")}>
              Gérer les réservations
            </DropdownMenuItem>
            {/* Add other admin links here if needed */}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
