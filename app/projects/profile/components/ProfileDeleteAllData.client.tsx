"use client";
import { handleDeleteAccount } from "@/server-actions/UserServerActions";
import { Button } from "@nextui-org/button";
import { IconExclamationCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfileDeleteAllData() {
  const router = useRouter();

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account and all associated data? This action cannot be undone."
    );

    if (confirmDelete) {
      const response = await handleDeleteAccount();
      if (response.success) {
        toast.success(response.message);
        await signOut({ redirect: false });
        router.push("/");
      } else {
        toast.error(response.message);
      }
    } else {
      toast("Account deletion cancelled.");
    }
  };

  return (
    <Button color="danger" onClick={deleteAccount}>
      <IconExclamationCircle size={16} />
      Delete account and all data
    </Button>
  );
}
