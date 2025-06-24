"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoIcon } from "lucide-react";

import { Button } from "../ui/button";

import { UserDetails } from "./details";

import { User } from "@/models/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserPreviewProps {
  user: User;
}

export const UserPreview = ({ user }: UserPreviewProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/user/${user.id}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <span>
          {user.firstName} {user.lastName}
        </span>
        <DialogTrigger asChild>
          <button
            aria-label="Voir les infos de l'utilisateur"
            className="text-gray-500 hover:text-blue-600 transition-colors"
            onClick={() => setOpen(true)}
          >
            <InfoIcon className="w-4 h-4" />
          </button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        <UserDetails user={user} />

        <div className="mt-4 flex justify-end">
          <Button className="text-blue-600" onClick={handleViewProfile}>
            Voir le profil complet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
