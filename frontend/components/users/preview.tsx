"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

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
      </DialogContent>
    </Dialog>
  );
};
