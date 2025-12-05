"use client";
import { Suspense, useEffect, useState } from "react";
import { User } from "@nextui-org/user";
import { getCurrentUser } from "@/server-actions/SidebarServerActions";

type UserData = {
  name: string;
  image: string;
} | null;

interface SidebarHeaderProps {
  isCollapsed?: boolean;
}

export default function SidebarHeader({
  isCollapsed = false,
}: SidebarHeaderProps) {
  const [userData, setUserData] = useState<UserData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="px-5 pt-3">
        <User name="Loading..." />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="px-5 pt-3">
      <Suspense fallback={<User name="Loading..." />}>
        <User
          name={isCollapsed ? "" : userData.name}
          description={isCollapsed ? "" : "Product Designer"}
          avatarProps={{
            src: userData.image,
          }}
        />
      </Suspense>
    </div>
  );
}
