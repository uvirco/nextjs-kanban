import AppSidebar from "@/ui/Sidebar/Sidebar";
import Navbar from "@/ui/Navbar/Navbar";
import NavbarAvatar from "@/ui/Navbar/NavbarAvatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar>
        <NavbarAvatar />
      </Navbar>
      <div className="flex grow min-w-0">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
