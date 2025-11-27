"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconTextPlus } from "@tabler/icons-react";
import {
  handleEditTaskDescription,
  handleDeleteTaskDescription,
} from "@/server-actions/DescriptionServerActions";
import TaskDetailItemHeading from "../ui/TaskDetailItemHeading";
import TaskDetailItemContent from "../ui/TaskDetailItemContent";

export default function TaskDetailDescription({
  taskId,
  taskDescription,
  boardId,
}: {
  taskId: string;
  taskDescription: string | null;
  boardId: string;
}) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [formData, setFormData] = useState({
    id: taskId,
    boardId,
    description: taskDescription || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEditDescription = () =>
    setIsEditingDescription(!isEditingDescription);

  const handleValueChange = (value: string) => {
    setFormData({ ...formData, description: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await handleEditTaskDescription(
      formData.id,
      formData.boardId,
      formData.description,
    );

    if (response.success) {
      toast.success("Description Updated");
      setIsEditingDescription(false);
      setError(null);
    } else {
      toast.error(response.message);
      setError(response.message);
    }

    setIsSubmitting(false);
  };

  const handleDeleteDescription = async () => {
    setIsDeleting(true);

    const response = await handleDeleteTaskDescription(taskId, boardId);

    if (response.success) {
      toast.success(response.message);
      setIsEditingDescription(false);
      setFormData({ id: taskId, boardId, description: "" });
      setError(null);
    } else {
      toast.error(response.message);
      setError(response.message);
    }

    setIsDeleting(false);
  };

  return (
    <>
      <TaskDetailItemHeading
        title="Description"
        icon={<IconTextPlus size={32} />}
      />
      <TaskDetailItemContent indented>
        {!isEditingDescription ? (
          <p onClick={toggleEditDescription} className="cursor-pointer text-foreground">
            {taskDescription ? (
              taskDescription
            ) : (
              <span className="text-blue-600 dark:text-blue-400">Add a description</span>
            )}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={formData.id} />
            <input type="hidden" name="boardId" value={formData.boardId} />
            <Textarea
              placeholder="Enter your description"
              autoFocus
              value={formData.description}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full mb-2 mt-1 border-none focus:outline-none resize-none"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="flex justify-center items-center"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" onClick={toggleEditDescription} type="button" variant="outline">
                Cancel
              </Button>
              {taskDescription && (
                <Button
                  size="sm"
                  disabled={isDeleting}
                  onClick={handleDeleteDescription}
                  type="button"
                  variant="destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </form>
        )}
      </TaskDetailItemContent>
    </>
  );
}
