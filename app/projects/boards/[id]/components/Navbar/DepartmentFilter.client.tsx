"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  IconBuilding,
  IconChevronDown,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
import { createPortal } from "react-dom";

interface DepartmentFilterProps {
  departments: Array<{ id: string; name: string }>;
  selectedDepartmentId: string | null;
}

export default function DepartmentFilter({
  departments,
  selectedDepartmentId,
}: DepartmentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDepartmentSelect = (departmentId: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (departmentId) {
        params.set("departmentId", departmentId);
      } else {
        params.delete("departmentId");
      }

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
      router.refresh(); // Force a server component refresh
    });
    setIsOpen(false);
  };

  const selectedDepartment = departments.find(
    (dept) => dept.id === selectedDepartmentId
  );

  const dropdown = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 bg-zinc-800 rounded-lg shadow-2xl z-[9999] max-h-[600px] overflow-y-auto border-2 border-green-500">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Filter by Department
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <IconX size={20} />
            </button>
          </div>

          <button
            onClick={() => handleDepartmentSelect(null)}
            disabled={isPending}
            className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors mb-2 ${
              !selectedDepartmentId
                ? "bg-green-600 text-white"
                : "text-zinc-300 hover:bg-zinc-700"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Show All Departments
          </button>

          {departments.length > 0 ? (
            <div className="space-y-2">
              {departments.map((department) => (
                <button
                  key={department.id}
                  onClick={() => handleDepartmentSelect(department.id)}
                  disabled={isPending}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    selectedDepartmentId === department.id
                      ? "bg-green-600 text-white"
                      : "text-zinc-300 hover:bg-zinc-700"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {department.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500">
              No departments found
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        onClick={() => !isPending && setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          selectedDepartmentId
            ? "bg-green-600 text-white"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        } ${isPending ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isPending ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : (
          <IconBuilding size={16} />
        )}
        {selectedDepartment ? (
          <>
            <span className="max-w-[150px] truncate">
              {selectedDepartment.name}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDepartmentSelect(null);
              }}
              className="ml-1 hover:bg-green-700 rounded p-0.5 cursor-pointer"
            >
              <IconX size={14} />
            </span>
          </>
        ) : (
          <>
            <span>{isPending ? "Loading..." : "Filter by Department"}</span>
            {!isPending && <IconChevronDown size={14} />}
          </>
        )}
      </button>

      {typeof window !== "undefined" &&
        dropdown &&
        createPortal(dropdown, document.body)}
    </>
  );
}
