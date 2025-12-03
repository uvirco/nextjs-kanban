"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { UIProvider } from "@/contexts/UIContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        themes={["light", "dark"]}
        enableSystem={false}
      >
        <UIProvider>{children}</UIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
