"use client";
import { Board, Label } from "@prisma/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconMinus, IconUser } from "@tabler/icons-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    console.log("BoardSettingsClient mounted", {
      boardId: board?.id,
      membersCount: currentMembers?.length,
      usersCount: allUsers?.length,
    });
  }, []);

  // Filter available users (not already members)
  const availableUsers = allUsers.filter(
    (user) => !currentMembers.some((member) => member.id === user.id)
  );

  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (userId: string) => {
    setIsLoading(userId);
    try {
      const response = await fetch(`/api/board/${board.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Refresh the page to show updated members
        window.location.reload();
      } else {
        console.error("Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(userId);
    try {
      const response = await fetch(`/api/board/${board.id}/members/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to show updated members
        window.location.reload();
      } else {
        console.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Board Settings</h1>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
        >
          ← Back to Board
        </button>
      </div>

      {/* Current Members Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <IconUser size={20} />
          Current Board Members ({currentMembers.length})
        </h2>

        {currentMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={member.image || undefined}
                      alt={member.name || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(member.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">
                      {member.name || "Unknown"}
                    </div>
                    <div className="text-sm text-zinc-400">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isLoading === member.id}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                  >
                    <IconMinus size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">No members yet. Add some below!</p>
        )}
      </div>

      {/* Add Members Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-white">
          Add Board Members
        </h2>

        <div className="mb-4">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        {filteredAvailableUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(user.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">
                      {user.name || "Unknown"}
                    </div>
                    <div className="text-sm text-zinc-400">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-zinc-600 text-zinc-300"
                  >
                    {user.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddMember(user.id)}
                    disabled={isLoading === user.id}
                    className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                  >
                    <IconPlus size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400">
            {searchTerm
              ? "No users found matching your search."
              : "All available users are already board members."}
          </p>
        )}
      </div>
    </div>
  );
}
