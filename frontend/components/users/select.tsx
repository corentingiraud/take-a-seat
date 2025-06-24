"use client";

import { useState } from "react";

import { User } from "@/models/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserSelectProps {
  users: User[];
  onChange: (user: User | null) => void;
  value?: User | null;
}

export const UserSelect = ({ users, onChange, value }: UserSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const sortedUsers = User.sortAlphabetically(users);

  const filteredUsers = sortedUsers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(search.toLowerCase());
  });

  const handleSelect = (user: User) => {
    onChange(user);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-start bg-transparent"
          variant="outline"
        >
          {value
            ? `${value.firstName} ${value.lastName}`
            : "Sélectionner un utilisateur"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Rechercher par nom ou prénom..."
            onValueChange={setSearch}
          />
          <ScrollArea className="h-64">
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelect(user)}>
                  {user.firstName} {user.lastName}
                </CommandItem>
              ))}
              {filteredUsers.length === 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              )}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
