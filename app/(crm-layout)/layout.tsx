import CRMLayout from "@/ui/CRM/CRMLayout";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function CRMRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <SessionProvider session={session}>
      <CRMLayout>{children}</CRMLayout>
    </SessionProvider>
  );
}
