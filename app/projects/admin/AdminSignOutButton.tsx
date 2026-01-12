"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
