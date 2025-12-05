import DashboardLayout from "@/ui/DashboardLayout";

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <main className="p-3 md:p-5 flex flex-col grow bg-zinc-900">
        {children}
      </main>
      {modal}
    </DashboardLayout>
  );
}
