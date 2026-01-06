import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { IconEdit } from "@tabler/icons-react";
import { Label } from "@/types/types";

export function LabelCheckboxGroup({
  labels,
  selectedLabels,
  handleCheckboxChange,
  enterEditMode,
}: {
  labels: Label[];
  selectedLabels: string[];
  handleCheckboxChange: (values: string[]) => void;
  enterEditMode: (label: Label) => void;
}) {
  return (
    <CheckboxGroup
      value={selectedLabels}
      onValueChange={handleCheckboxChange}
      className="mb-3"
    >
      {labels.map((label) => (
        <Checkbox
          key={label.id}
          value={label.id}
          classNames={{
            base: `inline-flex max-w-md w-full bg-zinc-800 hover:bg-zinc-700 m-0 items-center justify-start cursor-pointer rounded-lg gap-1 p-2 border border-zinc-600 data-[selected=true]:bg-zinc-600 data-[selected=true]:border-zinc-400`,
            label: "w-full flex items-center",
          }}
        >
          <div
            className={`bg-${label.color}-500 h-6 w-full rounded-md mr-2 py-1 px-2`}
          >
            {label.title && (
              <p className="text-xs font-semibold text-white">{label.title}</p>
            )}
          </div>
          <button onClick={() => enterEditMode(label)}>
            <IconEdit
              className="text-zinc-400 hover:text-zinc-300"
              size={22}
            />
          </button>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
