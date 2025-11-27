"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { UIProvider } from "@/contexts/UIContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={["light", "dark"]}
      enableSystem={false}
    >
      <UIProvider>{children}</UIProvider>
    </NextThemesProvider>
  );
}
