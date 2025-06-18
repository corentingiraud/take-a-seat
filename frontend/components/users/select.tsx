"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/models/user";

interface UserSelectProps {
  users: User[];
  onChange: (user: User | null) => void;
  value?: User | null;
}

export const UserSelect = ({ users, onChange, value }: UserSelectProps) => {
  const handleChange = (val: string) => {
    const index = parseInt(val);

    onChange(users[index]);
  };

  const selectedIndex =
    value && users.length > 0
      ? users.findIndex((u) => u.id === value.id)
      : null;

  return (
    <Select
      required
      name="user"
      value={selectedIndex?.toString() || ""}
      onValueChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner un utilisateur" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user, index) => (
          <SelectItem key={user.id} value={index.toString()}>
            {user.firstName} {user.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
