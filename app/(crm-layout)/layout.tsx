import CRMLayout from "@/ui/CRM/CRMLayout";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CRMRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user has CRM module permission (any role)
  const hasCrmAccess = session.user.modulePermissions?.crm;
  if (!hasCrmAccess) {
