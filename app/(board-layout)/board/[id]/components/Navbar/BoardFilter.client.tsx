"use client";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { LabelSummary } from "@/types/types";
import { IconFilter, IconFilterFilled, IconX } from "@tabler/icons-react";

const LabelColorIndicator = ({ color }: { color: string }) => (
  <div className={`h-4 w-4 rounded-full bg-${color}-500`} />
);

export default function BoardFilter({ labels }: { labels: LabelSummary[] }) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const labelQuery = searchParams.get("labels");
    if (labelQuery) {
      const labelIds = labelQuery.split(",");
      setSelectedLabels(labelIds);
    }
  }, [searchParams]);

  const handleLabelToggle = (labelId: string) => {
    const newSelection = selectedLabels.includes(labelId)
      ? selectedLabels.filter((id) => id !== labelId)
      : [...selectedLabels, labelId];

    setSelectedLabels(newSelection);

    const params = new URLSearchParams(searchParams);
    if (newSelection.length > 0) {
      params.set("labels", newSelection.join(","));
    } else {
      params.delete("labels");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const isFilterActive = selectedLabels.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="px-2 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        {isFilterActive ? (
          <IconFilterFilled size={16} />
        ) : (
          <IconFilter size={16} />
        )}
      </button>

      {popoverOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setPopoverOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">Filter by label</h4>
                <button onClick={() => setPopoverOpen(false)}>
                  <IconX size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {labels.map((label) => (
                  <label
                    key={label.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-zinc-800 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleLabelToggle(label.id)}
                        className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm">{label.title}</span>
                    </div>
                    <LabelColorIndicator color={label.color} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
