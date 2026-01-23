"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconTrash, IconRefresh } from "@tabler/icons-react";

interface RaciUser {
  id: string;
  name?: string;
  email?: string;
  roles: string[];
}

interface RaciMatrixSectionProps {
  raciUsers?: RaciUser[];
  /** epicId to fetch RACI entries when raciUsers not passed */
  epicId?: string;
}

interface User {
  id: string;
  name?: string;
  email: string;
}

const RACI_ROLES = [
  { value: 'RESPONSIBLE', label: 'Responsible', color: 'red' },
  { value: 'ACCOUNTABLE', label: 'Accountable', color: 'orange' },
  { value: 'CONSULTED', label: 'Consulted', color: 'blue' },
  { value: 'INFORMED', label: 'Informed', color: 'green' },
];

export default function RaciMatrixSection({
  raciUsers: providedRaciUsers,
  epicId,
}: RaciMatrixSectionProps) {
  const [raciUsers, setRaciUsers] = useState<RaciUser[]>(
    providedRaciUsers || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch RACI users and epic members
  const fetchRaciData = async () => {
    if (!epicId) return;
    try {
      setIsRefreshing(true);
      // Fetch RACI assignments
      const raciRes = await fetch(`/api/epics/${epicId}/raci`);
      const raciData = raciRes.ok ? await raciRes.json() : [];
      
      // Fetch epic members
      const membersRes = await fetch(`/api/epics/${epicId}/members`);
      const membersData = membersRes.ok ? await membersRes.json() : [];
      
      // Create a map of all users (from both RACI and members)
      const usersMap: Record<
        string,
        { id: string; name?: string; email?: string; roles: string[] }
      > = {};
      
      // Add all epic members first
      membersData.forEach((member: any) => {
        const uid = member.userId || member.user?.id;
        if (!uid) return;
        if (!usersMap[uid]) {
          usersMap[uid] = {
            id: uid,
            name: member.user?.name || member.user?.email,
            email: member.user?.email,
            roles: [],
          };
        }
      });
      
      // Then add RACI assignments
      raciData.forEach((entry: any) => {
        const uid = entry.userId || entry.user?.id;
        if (!uid) return;
        if (!usersMap[uid]) {
          usersMap[uid] = {
            id: uid,
            name: entry.user?.name || entry.user?.email,
            email: entry.user?.email,
            roles: [],
          };
        }
        if (entry.role && !usersMap[uid].roles.includes(entry.role)) {
          usersMap[uid].roles.push(entry.role);
        }
      });
      
      const arr = Object.values(usersMap);
      setRaciUsers(arr);
    } catch (_err) {
      console.error('Failed to fetch RACI/members data:', _err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRaciData();
  }, [epicId, providedRaciUsers]);

  // Fetch all users when editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, [isEditing]);

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole || !epicId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/epics/${epicId}/raci`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        // Refresh RACI data
        const raciRes = await fetch(`/api/epics/${epicId}/raci`);
        if (raciRes.ok) {
          const data = await raciRes.json();
          const usersMap: Record<string, RaciUser> = {};
          data.forEach((entry: any) => {
            const uid = entry.userId || entry.user?.id;
            if (!uid) return;
            if (!usersMap[uid]) {
              usersMap[uid] = {
                id: uid,
                name: entry.user?.name || entry.user?.email,
                email: entry.user?.email,
                roles: [],
              };
            }
            if (entry.role && !usersMap[uid].roles.includes(entry.role)) {
              usersMap[uid].roles.push(entry.role);
            }
          });
          setRaciUsers(Object.values(usersMap));
        }
        setSelectedUser("");
        setSelectedRole("");
      }
    } catch (error) {
      console.error('Failed to add RACI role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!epicId) return;
    
    setIsLoading(true);
    try {
      const url = `/api/epics/${epicId}/raci/${userId}/${role}`;
      console.log('Deleting RACI role:', { epicId, userId, role, url });
      
      const res = await fetch(url, {
        method: 'DELETE',
      });

      console.log('Delete response:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to delete RACI role:', errorData);
        throw new Error(errorData.error || 'Failed to delete');
      }

      // Refresh RACI data (fetch both RACI and members to keep all users visible)
      await fetchRaciData();
    } catch (error) {
      console.error('Failed to remove RACI role:', error);
      alert('Failed to remove RACI role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = async (userId: string, role: string, currentlyHas: boolean) => {
    if (currentlyHas) {
      await handleRemoveRole(userId, role);
    } else {
      if (!epicId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/epics/${epicId}/raci`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, role }),
        });

        if (res.ok) {
          // Refresh RACI data (fetch both RACI and members to keep all users visible)
          await fetchRaciData();
        }
      } catch (error) {
        console.error('Failed to toggle RACI role:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">👥 RACI Matrix</h3>
          <div className="text-xs text-zinc-400">
            Who is Responsible / Accountable / Consulted / Informed
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRaciData}
            disabled={isRefreshing}
            className="bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700"
          >
            <IconRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {epicId && (
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing 
                ? "bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700" 
                : "bg-blue-600 text-white hover:bg-blue-700"
              }
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg">
          <p className="text-sm text-zinc-400">
            Click on the checkboxes below to assign RACI roles to project members. If you just added new members, click the refresh button above to update the list.
          </p>
        </div>
      )}

          {raciUsers.length > 0 ? (
            <div id="raci-table" className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-3 px-4 text-zinc-300 font-semibold">
                      Team Member
                    </th>
                    <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="text-red-400 font-bold">R</span>
                        <span className="text-xs text-zinc-500">
                          Responsible
                        </span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="text-orange-400 font-bold">A</span>
                        <span className="text-xs text-zinc-500">
                          Accountable
                        </span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="text-blue-400 font-bold">C</span>
                        <span className="text-xs text-zinc-500">Consulted</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="text-green-400 font-bold">I</span>
                        <span className="text-xs text-zinc-500">Informed</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {raciUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs">
                            {(user.name || user.email || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.name || user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        {isEditing ? (
                          <button
                            onClick={() => toggleRole(user.id, 'RESPONSIBLE', user.roles.includes("RESPONSIBLE"))}
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm transition-all ${
                              user.roles.includes("RESPONSIBLE")
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                            }`}
                          >
                            {user.roles.includes("RESPONSIBLE") ? '✓' : '―'}
                          </button>
                        ) : user.roles.includes("RESPONSIBLE") ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded font-bold text-sm">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                            ―
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {isEditing ? (
                          <button
                            onClick={() => toggleRole(user.id, 'ACCOUNTABLE', user.roles.includes("ACCOUNTABLE"))}
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm transition-all ${
                              user.roles.includes("ACCOUNTABLE")
                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                            }`}
                          >
                            {user.roles.includes("ACCOUNTABLE") ? '✓' : '―'}
                          </button>
                        ) : user.roles.includes("ACCOUNTABLE") ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500/20 text-orange-400 rounded font-bold text-sm">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                            ―
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {isEditing ? (
                          <button
                            onClick={() => toggleRole(user.id, 'CONSULTED', user.roles.includes("CONSULTED"))}
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm transition-all ${
                              user.roles.includes("CONSULTED")
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                            }`}
                          >
                            {user.roles.includes("CONSULTED") ? '✓' : '―'}
                          </button>
                        ) : user.roles.includes("CONSULTED") ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded font-bold text-sm">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                            ―
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {isEditing ? (
                          <button
                            onClick={() => toggleRole(user.id, 'INFORMED', user.roles.includes("INFORMED"))}
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm transition-all ${
                              user.roles.includes("INFORMED")
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                            }`}
                          >
                            {user.roles.includes("INFORMED") ? '✓' : '―'}
                          </button>
                        ) : user.roles.includes("INFORMED") ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded font-bold text-sm">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                            ―
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-medium mb-2">
                No project members yet
              </div>
              <div className="text-sm">
                Add team members to this project first, then assign RACI roles.
              </div>
            </div>
          )}

          {/* RACI Legend */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
            <h3 className="text-white font-medium mb-3">
              RACI Role Definitions:
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">R</span>
                <span className="text-zinc-300">
                  <strong>Responsible</strong> - Does the work
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 font-bold">A</span>
                <span className="text-zinc-300">
                  <strong>Accountable</strong> - Ultimately answerable
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">C</span>
                <span className="text-zinc-300">
                  <strong>Consulted</strong> - Provides input
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">I</span>
                <span className="text-zinc-300">
                  <strong>Informed</strong> - Needs to know
                </span>
              </div>
            </div>
          </div>
    </div>
  );
}
