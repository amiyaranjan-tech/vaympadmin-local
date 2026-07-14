import type { User } from "@/types";

export interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
}

export interface UserDetailsSheetProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
