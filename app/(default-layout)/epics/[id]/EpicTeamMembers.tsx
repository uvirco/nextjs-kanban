"use client";

import { useState, useEffect } from "react";
import { IconUsers, IconEdit, IconUser } from "@tabler/icons-react";
import Link from "next/link";

interface EpicMember {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface EpicTeamMembersProps {
  epicId: string;
}

export default function EpicTeamMembers({ epicId }: EpicTeamMembersProps) {
  const [members, setMembers] = useState<EpicMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [epicId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/epics/${epicId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching epic members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          👥 Epic Team Members
        </h2>
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">👥 Epic Team Members</h2>
        <Link
          href={`/epics/${epicId}/edit`}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <IconEdit size={16} />
          Edit Team
        </Link>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <IconUser size={16} className="text-zinc-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {member.user.name || member.user.email}{" "}
                  <span className="text-zinc-400 text-sm">• {member.role}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <IconUsers size={48} className="text-zinc-600 mx-auto mb-4" />
            <div className="text-zinc-500 mb-4">
              No team members assigned yet
            </div>
            <Link
              href={`/epics/${epicId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <IconEdit size={16} />
              Add Team Members
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
