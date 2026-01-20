"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconUsers,
  IconCurrencyDollar,
  IconLayoutKanban,
  IconMenu2,
  IconX,
  IconUser,
  IconBuilding,
  IconMail,
  IconPackage,
} from "@tabler/icons-react";
import PipelineSelector from "./PipelineSelector";

const crmNavItems = [
  { path: "/crm", label: "Dashboard", icon: IconLayoutKanban },
  { path: "/crm/contacts", label: "Contacts", icon: IconUsers },
  { path: "/crm/organizations", label: "Organizations", icon: IconBuilding },
  { path: "/crm/products", label: "Products", icon: IconPackage },
  { path: "/crm/emails", label: "Email Inbox", icon: IconMail },
  { path: "/crm/deals", label: "Pipeline", icon: IconCurrencyDollar },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950">
      {/* CRM Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/crm" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <IconCurrencyDollar className="text-white" size={24} />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  CRM
                </h1>
                <p className="text-xs text-zinc-500">Sales Pipeline</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {crmNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Pipeline Selector */}
            <PipelineSelector />

            {/* Back to Main App */}
            <Link
              href="/board"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <IconLayoutKanban size={18} />
              <span>Back to Boards</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>

            {/* User Avatar */}
            <Link
              href="/projects/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <IconUser size={18} className="text-white" />
              </div>
              {session?.user?.name && (
                <span className="text-sm text-white hidden md:block">
                  {session.user.name}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-900">
            <nav className="flex flex-col p-4 gap-2">
              {crmNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <hr className="border-zinc-800 my-2" />
              <Link
                href="/projects/boards"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <IconLayoutKanban size={20} />
                <span>Back to Boards</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* CRM Content */}
      <main className="min-h-[calc(100vh-73px)]">{children}</main>
    </div>
  );
}
