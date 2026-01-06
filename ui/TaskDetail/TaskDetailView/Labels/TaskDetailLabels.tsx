"use client";
import { useState, useEffect } from "react";
import { IconTag } from "@tabler/icons-react";
import TaskDetailItemHeading from "../ui/TaskDetailItemHeading";
import TaskDetailItemContent from "../ui/TaskDetailItemContent";
import AddToCardLabels from "@/ui/AddToCardLabels";
import LabelView from "@/ui/LabelView";
import { supabase } from "@/lib/supabase";

interface TaskDetailLabelsProps {
  taskId: string;
  boardId: string;
  initialLabels: { id: string; color: string; title: string | null }[];
}

export default function TaskDetailLabels({
  taskId,
  boardId,
  initialLabels,
}: TaskDetailLabelsProps) {
  const [labels, setLabels] = useState(initialLabels);
  const [availableLabels, setAvailableLabels] = useState<
    { id: string; color: string; title: string | null }[]
  >([]);

  useEffect(() => {
    fetchAvailableLabels();
  }, [boardId]);

  const fetchAvailableLabels = async () => {
    try {
      const { data, error } = await supabase
        .from("Label")
        .select("id, color, title")
        .eq("boardId", boardId);

      if (error) {
        console.error("Error fetching labels:", error);
        return;
      }

      setAvailableLabels(data || []);
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  };

  const handleLabelsUpdated = () => {
    // Refetch task labels
    window.location.reload(); // Simple refresh for now
  };

  const handleLabelRemoved = () => {
    // Refetch task labels
    window.location.reload(); // Simple refresh for now
  };

  return (
    <>
      <TaskDetailItemHeading title="Labels" icon={<IconTag size={26} />} />
      <TaskDetailItemContent indented>
        <div className="flex flex-wrap gap-2 mb-2">
          {labels.map((label) => (
            <LabelView
              key={label.id}
              label={label}
              taskId={taskId}
              boardId={boardId}
              onLabelUpdated={handleLabelsUpdated}
              onLabelRemoved={handleLabelRemoved}
            />
          ))}
        </div>
        <AddToCardLabels
          taskId={taskId}
          boardId={boardId}
          currentLabels={labels}
          availableLabels={availableLabels}
          onLabelsUpdated={handleLabelsUpdated}
        />
      </TaskDetailItemContent>
    </>
  );
}
