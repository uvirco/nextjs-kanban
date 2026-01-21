import DashboardLayout from "@/ui/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user has Projects module permission (any role)
  const hasProjectsAccess = session.user.modulePermissions?.projects;
  if (!hasProjectsAccess) {
    redirect("/"); // Redirect to home page if no Projects access
  }
  
  return (
    <DashboardLayout>
      {children}
      {modal}
    </DashboardLayout>
  );
}
