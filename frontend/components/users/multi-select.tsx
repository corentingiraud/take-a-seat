"use client";

import { useState } from "react";

import { User } from "@/models/user";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiUserSelectProps {
  users: User[];
  value: User[];
  onChange: (selected: User[]) => void;
}

export const MultiUserSelect = ({
  users,
  value,
  onChange,
}: MultiUserSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleUser = (user: User) => {
    const exists = value.find((u) => u.id === user.id);

    if (exists) {
      onChange(value.filter((u) => u.id !== user.id));
    } else {
      onChange([...value, user]);
    }
  };

  const sortedUsers = User.sortAlphabetically(users);

  const filteredUsers = sortedUsers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(search.toLowerCase());
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          {value.length > 0
            ? value.map((u) => `${u.firstName} ${u.lastName}`).join(", ")
            : "Sélectionner les utilisateurs"}
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
                <CommandItem
                  key={user.id}
                  className="flex items-center gap-2"
                  onSelect={() => toggleUser(user)}
                >
                  <Checkbox
                    checked={value.some((u) => u.id === user.id)}
                    onCheckedChange={() => toggleUser(user)}
                  />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
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
