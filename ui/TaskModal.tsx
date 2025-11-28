"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ThemeProvider } from "next-themes";

export default function TaskModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-background text-foreground dark">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["light", "dark"]}
          enableSystem={false}
        >
          <div className="dark">{children}</div>
        </ThemeProvider>
      </DialogContent>
    </Dialog>
  );
}
