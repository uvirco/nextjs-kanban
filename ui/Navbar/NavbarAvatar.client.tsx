"use client";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavbarAvatarClient({
  userName,
  userImage,
}: {
  userName: string;
  userImage: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (action: "profile" | "signout") => {
    setIsOpen(false);
    if (action === "profile") {
      router.push("/profile");
    } else if (action === "signout") {
      await signOut({ redirect: false });
      router.push("/");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-purple-500 border-2 border-white rounded-full hover:bg-purple-600 transition-colors"
      >
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg">
            <div className="py-1">
              <button
                onClick={() => handleAction("profile")}
                className="flex items-center w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                <IconUser size={18} className="mr-3" />
                Profile
              </button>
              <button
                onClick={() => handleAction("signout")}
                className="flex items-center w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                <IconLogout size={18} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
