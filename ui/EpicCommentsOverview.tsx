"use client";
import { useState, useEffect } from "react";
import { IconMessage, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskDetailItemHeading from "@/ui/TaskDetail/TaskDetailView/ui/TaskDetailItemHeading";
import TaskDetailItemContent from "@/ui/TaskDetail/TaskDetailView/ui/TaskDetailItemContent";

interface EpicCommentsOverviewProps {
  epicId: string;
}

interface CommentWithTask {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  task: {
    id: string;
    title: string;
  };
}

export default function EpicCommentsOverview({ epicId }: EpicCommentsOverviewProps) {
  const [comments, setComments] = useState<CommentWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchComments();
  }, [epicId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/epics/${epicId}/comments-overview`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch epic comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Group comments by task
  const commentsByTask = comments.reduce((acc, comment) => {
    if (!acc[comment.task.id]) {
      acc[comment.task.id] = {
        task: comment.task,
        comments: []
      };
    }
    acc[comment.task.id].comments.push(comment);
    return acc;
  }, {} as Record<string, { task: CommentWithTask['task'], comments: CommentWithTask[] }>);

  const taskEntries = Object.values(commentsByTask);

  if (loading) {
    return (
      <div className="mt-6">
        <TaskDetailItemHeading title="Comments Overview" icon={<IconMessage size={32} />} />
        <TaskDetailItemContent indented>
          <div className="text-center py-8 text-zinc-500">
            Loading comments...
          </div>
        </TaskDetailItemContent>
      </div>
    );
  }

  if (taskEntries.length === 0) {
    return (
      <div className="mt-6">
        <TaskDetailItemHeading title="Comments Overview" icon={<IconMessage size={32} />} />
        <TaskDetailItemContent indented>
          <div className="text-center py-8 text-zinc-500">
            No comments found across epic tasks
          </div>
        </TaskDetailItemContent>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <TaskDetailItemHeading title="Comments Overview" icon={<IconMessage size={32} />} />
      <TaskDetailItemContent indented>
        <div className="space-y-4">
          {taskEntries.map(({ task, comments: taskComments }) => (
            <div key={task.id} className="border border-zinc-700 rounded-lg bg-zinc-800/50">
              <button
                onClick={() => toggleTaskExpansion(task.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTasks.has(task.id) ? (
                    <IconChevronDown size={20} className="text-zinc-400" />
                  ) : (
                    <IconChevronRight size={20} className="text-zinc-400" />
                  )}
                  <span className="font-medium text-white">{task.title}</span>
                  <span className="text-sm text-zinc-400">
                    ({taskComments.length} comment{taskComments.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </button>

              {expandedTasks.has(task.id) && (
                <div className="border-t border-zinc-700">
                  <div className="divide-y divide-zinc-700">
                    {taskComments.map((comment) => (
                      <div key={comment.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 border border-zinc-600">
                            <AvatarImage
                              src={comment.user.image || undefined}
                              alt={comment.user.name}
                            />
                            <AvatarFallback className="text-xs bg-zinc-700 text-zinc-300">
                              {comment.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white text-sm">
                                {comment.user.name}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-zinc-300 text-sm whitespace-pre-wrap">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </TaskDetailItemContent>
    </div>
  );
}