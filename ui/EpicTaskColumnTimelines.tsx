"use client";

import { useEffect, useState } from "react";
import { TaskColumnTimeline } from "@/ui/TaskColumnTimeline";

interface Subtask {
  id: string;
  title: string;
}

interface EpicTaskColumnTimelinesProps {
  epicId: string;
}

export function EpicTaskColumnTimelines({ epicId }: EpicTaskColumnTimelinesProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/epics/${epicId}/subtasks`)
      .then(res => res.json())
      .then(data => {
        setSubtasks(data.subtasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [epicId]);

  if (loading) return <div>Loading subtasks...</div>;
  if (!subtasks.length) return <div>No subtasks</div>;

  return (
    <div>
      {subtasks.map(subtask => (
        <div key={subtask.id}>
          <div>{subtask.title}</div>
          <TaskColumnTimeline taskId={subtask.id} />
        </div>
      ))}
    </div>
  );
}