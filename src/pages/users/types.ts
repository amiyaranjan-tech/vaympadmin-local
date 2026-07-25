import type { User } from "@/types/user";

export interface UserSearchProps {
  search: string;
  onSearchChange: (value: string) => void;

  status: string;
  onStatusChange: (value: string) => void;

  isVerified: string;
  onVerifiedChange: (value: string) => void;
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
