"use client";

import { useState } from "react";
import { IconUserPlus, IconUserMinus, IconMail, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import ManageMembersModal from "./ManageMembersModal";

interface TeamMember {
  id: string;
  epicId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Stakeholder {
  id: string;
  taskId: string;
  userId: string;
  type: string;
  addedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface TeamTabProps {
  epicId: string;
  members?: TeamMember[];
  stakeholders?: Stakeholder[];
  onMembersChange?: () => void;
}

export default function TeamTab({
  epicId,
  members = [],
  stakeholders = [],
  onMembersChange,
}: TeamTabProps) {
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleMemberAdded = () => {
    setShowMemberModal(false);
    if (onMembersChange) {
      onMembersChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Members Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconUser size={20} className="text-zinc-400" />
            <h3 className="text-lg font-semibold text-white">Team Members</h3>
            <span className="text-sm text-zinc-500">({members.length})</span>
          </div>
          <Button
            onClick={() => setShowMemberModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <IconUserPlus size={16} className="mr-2" />
            Add Member
          </Button>
        </div>

        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name ?? "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300">
                      {((member.user.name ?? member.user.email) || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-zinc-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-300 rounded">
                    {member.role || "Member"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <p>No team members yet</p>
            <p className="text-sm mt-2">Add people to collaborate on this project</p>
          </div>
        )}
      </div>

      {/* Stakeholders Section */}
      {stakeholders && stakeholders.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconMail size={20} className="text-zinc-400" />
            <h3 className="text-lg font-semibold text-white">Stakeholders</h3>
            <span className="text-sm text-zinc-500">({stakeholders.length})</span>
          </div>

          <div className="space-y-3">
            {stakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {stakeholder.user.image ? (
                    <img
                      src={stakeholder.user.image}
                      alt={stakeholder.user.name ?? "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300">
                      {((stakeholder.user.name ?? stakeholder.user.email) || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {stakeholder.user.name || stakeholder.user.email}
                    </p>
                    <p className="text-sm text-zinc-400">{stakeholder.user.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-amber-900/30 text-amber-300 rounded">
                  {stakeholder.type || "Stakeholder"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && (
        <ManageMembersModal
          epicId={epicId}
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onMemberAdded={handleMemberAdded}
          members={members}
        />
      )}
    </div>
  );
}
