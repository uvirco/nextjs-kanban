"use client";
import { Board, Label } from "@prisma/client";

interface UserSummary {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface BoardSettingsClientProps {
  board: Board & { members: any[]; labels: Label[]; settings: any };
  allUsers: UserSummary[];
  currentMembers: UserSummary[];
  labels: Label[];
}

export default function BoardSettingsClient({
  board,
  allUsers,
  currentMembers,
  labels,
}: BoardSettingsClientProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Board Settings</h1>
      <p>Board settings functionality coming soon...</p>
    </div>
  );
}