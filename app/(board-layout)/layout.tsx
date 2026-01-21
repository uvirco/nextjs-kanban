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
  
  return (
    <DashboardLayout>
      {children}
      {modal}
    </DashboardLayout>
  );
}
