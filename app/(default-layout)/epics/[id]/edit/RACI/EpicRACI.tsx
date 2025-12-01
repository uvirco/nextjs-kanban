"use client";

import { useState, useEffect } from "react";
import { IconUsers, IconX } from "@tabler/icons-react";

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

interface RACIEntry {
  id: string;
  epicId: string;
  userId: string;
  role: "RESPONSIBLE" | "ACCOUNTABLE" | "CONSULTED" | "INFORMED";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface EpicRACIProps {
  epicId: string;
  teamMembers: EpicMember[];
}

const raciRoles = [
  {
    value: "RESPONSIBLE",
    label: "Responsible",
    color: "bg-red-500",
    description: "Does the work",
  },
  {
    value: "ACCOUNTABLE",
    label: "Accountable",
    color: "bg-orange-500",
    description: "Ultimately answerable",
  },
  {
    value: "CONSULTED",
    label: "Consulted",
    color: "bg-blue-500",
    description: "Provides input",
  },
  {
    value: "INFORMED",
    label: "Informed",
    color: "bg-green-500",
    description: "Needs to know",
  },
] as const;

export default function EpicRACI({ epicId, teamMembers }: EpicRACIProps) {
  const [raciEntries, setRaciEntries] = useState<RACIEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchRaciEntries();
    }
  }, [isExpanded]);

  const fetchRaciEntries = async () => {
    try {
      const response = await fetch(`/api/epics/${epicId}/raci`);
      if (response.ok) {
        const data = await response.json();
        setRaciEntries(data);
      }
    } catch (error) {
      console.error("Error fetching RACI entries:", error);
    }
  };

  const removeRaciEntry = async (userId: string, role: string) => {
    if (!confirm("Remove this RACI assignment?")) return;

    try {
      const response = await fetch(
        `/api/epics/${epicId}/raci/${userId}/${role}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setRaciEntries(
          raciEntries.filter(
            (entry) => !(entry.userId === userId && entry.role === role)
          )
        );
      } else {
        alert("Failed to remove RACI assignment");
      }
    } catch (error) {
      console.error("Error removing RACI entry:", error);
      alert("Failed to remove RACI assignment");
    }
  };

  const getRoleColor = (role: string) => {
    const roleConfig = raciRoles.find((r) => r.value === role);
    return roleConfig?.color || "bg-gray-500";
  };

  const getRoleLabel = (role: string) => {
    const roleConfig = raciRoles.find((r) => r.value === role);
    return roleConfig?.label || role;
  };

  const getRoleDescription = (role: string) => {
    const roleConfig = raciRoles.find((r) => r.value === role);
    return roleConfig?.description || "";
  };

  // Group entries by user
  const groupedEntries = raciEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.userId]) {
        acc[entry.userId] = {
          user: entry.user,
          roles: [],
        };
      }
      acc[entry.userId].roles.push(entry.role);
      return acc;
    },
    {} as Record<string, { user: RACIEntry["user"]; roles: string[] }>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">🎯 RACI Matrix</h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm"
        >
          <IconUsers size={16} />
          {isExpanded ? "Hide" : "Show"} RACI ({raciEntries.length})
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-zinc-800 rounded-lg">
          {/* RACI Role Legend */}
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">RACI Roles:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {raciRoles.map((role) => (
                <div key={role.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${role.color}`}></div>
                  <span className="text-zinc-300">
                    <strong>{role.label[0]}</strong> - {role.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current RACI Assignments */}
          <div className="space-y-2 mb-4">
            {Object.entries(groupedEntries).length > 0 ? (
              Object.entries(groupedEntries).map(
                ([userId, { user, roles }]) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 bg-zinc-700 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-xs">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span>
                            {(user.name || user.email || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.name || user.email}
                        </div>
                        <div className="text-zinc-400 text-sm">
                          {teamMembers.find((m) => m.user.id === userId)?.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {roles.map((role) => (
                        <div key={role} className="flex items-center gap-1">
                          <span
                            className={`px-2 py-1 text-xs text-white rounded ${getRoleColor(role)}`}
                            title={getRoleDescription(role)}
                          >
                            {getRoleLabel(role)[0]}
                          </span>
                          <button
                            onClick={() => removeRaciEntry(userId, role)}
                            className="text-zinc-400 hover:text-red-400 transition-colors"
                            title="Remove RACI role"
                          >
                            <IconX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="text-zinc-500 text-center py-4 bg-zinc-700 rounded">
                No RACI assignments yet. Add team members above to assign RACI
                roles.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
