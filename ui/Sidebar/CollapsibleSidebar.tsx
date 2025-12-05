"use client";
import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import SidebarMenuContent from "./SidebarMenuContent";

export default function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`relative transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
      >
        {isCollapsed ? (
          <IconChevronRight size={14} className="text-zinc-400" />
        ) : (
          <IconChevronLeft size={14} className="text-zinc-400" />
        )}
      </button>

      {/* Sidebar Content */}
      <div
        className="fixed left-0 top-0 bottom-0 bg-zinc-950 z-40 border-r border-zinc-900 transition-all duration-300"
        style={{ width: isCollapsed ? "64px" : "256px" }}
      >
        {/* Brand Title */}
        <div className="px-5 py-4 border-b border-zinc-900">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
            </div>
          ) : (
            <h1 className="text-lg font-semibold text-white">
              Uvirco Projects
            </h1>
          )}
        </div>

        {/* Menu Content */}
        <SidebarMenuContent isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
