"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfileSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
    >
      Sign Out
    </button>
  );
}
