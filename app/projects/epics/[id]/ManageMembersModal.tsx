"use client";
import { useState, useEffect } from "react";
import { IconX, IconPlus, IconTrash, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface EpicMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ManageMembersModalProps {
  epicId: string;
  currentMembers?: EpicMember[];
  members?: EpicMember[];
  onClose: () => void;
  onSave?: (updatedMembers: EpicMember[]) => void;
  onMemberAdded?: () => void;
  isOpen?: boolean;
}

export default function ManageMembersModal({
  epicId,
  currentMembers,
  members,
  onClose,
  onSave,
  onMemberAdded,
  isOpen = true,
}: ManageMembersModalProps) {
  const memberList = currentMembers || members || [];
  const [memberState, setMembers] = useState<EpicMember[]>(memberList);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("contributor");
  const [selectedRoleCategory, setSelectedRoleCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available users and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const rolesResponse = await fetch("/api/roles");
        if (rolesResponse.ok) {
          const rolesList = await rolesResponse.json();
          setRoles(rolesList);
        }

        // Fetch users
        const usersResponse = await fetch("/api/users");
        if (usersResponse.ok) {
          const allUsers = await usersResponse.json();
          // Filter out users already in the epic
          const currentUserIds = memberState.map(m => m.user.id);
          const available = allUsers.filter((user: User) => !currentUserIds.includes(user.id));
          setAvailableUsers(available);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [memberState]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/epics/${epicId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const newMember = await response.json();
        setMembers([...memberState, newMember]);
        setSelectedUserId("");
        setSelectedRole("contributor");
        if (onMemberAdded) onMemberAdded();
      } else {
        console.error("Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/epics/${epicId}/members/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMembers(memberState.filter(m => m.id !== memberId));
        if (onMemberAdded) onMemberAdded();
      } else {
        console.error("Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(memberState);
    }
    onClose();
  };

  // Filter roles by selected category
  const filteredRoles =
    selectedRoleCategory === "all"
      ? roles
      : roles.filter((role) => role.category === selectedRoleCategory);

  // Get unique role categories
  const roleCategories = ["all", ...new Set(roles.map((role) => role.category))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Epic Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Member Section */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Team Member</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-white">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-select" className="text-white">Role (Optional)</Label>
                
                {roles.length > 0 && roleCategories.length > 1 && (
                  <Select value={selectedRoleCategory} onValueChange={setSelectedRoleCategory}>
                    <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="stakeholder">Stakeholder</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <IconPlus size={16} className="mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
          </div>

          {/* Current Members Section */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Current Team Members</h3>
            <div className="space-y-3">
              {memberState.length === 0 ? (
                <p className="text-zinc-500 text-sm">No team members assigned</p>
              ) : (
                memberState.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-zinc-700 rounded p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback>
                          {member.user.name?.[0] || member.user.email?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-zinc-400">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="capitalize">
                        {member.role}
                      </Badge>
                      <Button
                        onClick={() => handleRemoveMember(member.id, member.user.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-600 hover:bg-red-900"
                        disabled={isLoading}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}