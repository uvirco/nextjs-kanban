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
  
  return (
    <SessionProvider session={session}>
      <CRMLayout>{children}</CRMLayout>
    </SessionProvider>
  );
}
