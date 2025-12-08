"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  IconFilter,
  IconChevronDown,
  IconX,
  IconLoader2,
} from "@tabler/icons-react";
import { createPortal } from "react-dom";

interface EpicFilterProps {
  epicTasks: Array<{ id: string; title: string }>;
  selectedEpicId: string | null;
}

export default function EpicFilter({ epicTasks, selectedEpicId }: EpicFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleEpicSelect = (epicId: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (epicId) {
        params.set("epicId", epicId);
      } else {
        params.delete("epicId");
      }
      
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
      router.refresh(); // Force a server component refresh
    });
    setIsOpen(false);
  };

  const selectedEpic = epicTasks.find(epic => epic.id === selectedEpicId);

  const dropdown = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 bg-zinc-800 rounded-lg shadow-2xl z-[9999] max-h-[600px] overflow-y-auto border-2 border-blue-500">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Filter by Epic</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <IconX size={20} />
            </button>
          </div>
          
          <button
            onClick={() => handleEpicSelect(null)}
            disabled={isPending}
            className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors mb-2 ${
              !selectedEpicId
                ? "bg-blue-600 text-white"
                : "text-zinc-300 hover:bg-zinc-700"
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Show All Tasks
          </button>
          
          {epicTasks.length > 0 ? (
            <div className="space-y-2">
              {epicTasks.map((epic) => (
                <button
                  key={epic.id}
                  onClick={() => handleEpicSelect(epic.id)}
                  disabled={isPending}
                  className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    selectedEpicId === epic.id
                      ? "bg-blue-600 text-white"
                      : "text-zinc-300 hover:bg-zinc-700"
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {epic.title}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500">
              No epics found
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
          selectedEpicId
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        } ${isPending ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isPending ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : (
          <IconFilter size={16} />
        )}
        {selectedEpic ? (
          <>
            <span className="max-w-[150px] truncate">{selectedEpic.title}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleEpicSelect(null);
              }}
              className="ml-1 hover:bg-blue-700 rounded p-0.5 cursor-pointer"
            >
              <IconX size={14} />
            </span>
          </>
        ) : (
          <>
            <span>{isPending ? 'Loading...' : 'Filter by Epic'}</span>
            {!isPending && <IconChevronDown size={14} />}
          </>
        )}
      </button>
      
      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </>
  );
}
