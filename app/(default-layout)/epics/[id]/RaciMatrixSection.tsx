"use client";
import { useEffect, useState } from "react";

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

export default function RaciMatrixSection({
  raciUsers: providedRaciUsers,
  epicId,
}: RaciMatrixSectionProps) {
  const [raciUsers, setRaciUsers] = useState<RaciUser[]>(
    providedRaciUsers || []
  );

  // if epicId provided and raciUsers weren't passed from server, fetch
  useEffect(() => {
    let mounted = true;
    const fetchIfNeeded = async () => {
      if (providedRaciUsers?.length) return;
      if (!epicId) return;
      try {
        const res = await fetch(`/api/epics/${epicId}/raci`);
        if (!res.ok) return;
        const data = await res.json();
        // transform entries into raciUsers: unique users + roles
        const usersMap: Record<
          string,
          { id: string; name?: string; email?: string; roles: string[] }
        > = {};
        (data || []).forEach((entry: any) => {
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
        if (mounted) setRaciUsers(arr);
      } catch (_err) {
        // ignore fetch errors
      }
    };

    fetchIfNeeded();
    return () => {
      mounted = false;
    };
  }, [epicId, providedRaciUsers]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">👥 RACI Matrix</h3>
      <div className="text-xs text-zinc-400 mb-4">
        Who is Responsible / Accountable / Consulted / Informed
      </div>

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
                        {user.roles.includes("RESPONSIBLE") ? (
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
                        {user.roles.includes("ACCOUNTABLE") ? (
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
                        {user.roles.includes("CONSULTED") ? (
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
                        {user.roles.includes("INFORMED") ? (
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
                No RACI assignments yet
              </div>
              <div className="text-sm">
                Add team members to this epic and assign RACI roles to see the
                matrix.
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
