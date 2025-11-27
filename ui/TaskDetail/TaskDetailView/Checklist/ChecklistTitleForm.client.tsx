"use client";
import { useState } from "react";
import { handleEditChecklistName } from "@/server-actions/ChecklistServerActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

interface ChecklistTitleFormProps {
  checklistTitle: string | null;
  checklistId: string;
  taskId: string;
}

export default function ChecklistTitleForm({
  checklistTitle,
  checklistId,
  taskId,
}: ChecklistTitleFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState(checklistTitle || "Checklist");
  const [isLoading, setIsLoading] = useState(false);

  const toggleEditState = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    data.append("checklistId", checklistId);
    data.append("taskId", taskId);

    const response = await handleEditChecklistName(data);
    if (response.success) {
      toggleEditState();
    } else {
      setError(response.message);
    }
    setIsLoading(false);
  };

  return (
    <>
      {isEditing ? (
        <form
          className="flex grow justify-between gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }}
        >
          <Input
            autoComplete="off"
            type="text"
            name="title"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter a name for your checklist..."
            autoFocus
            className="flex-1"
          />
          <Button size="sm" type="submit" disabled={isLoading}>
            Submit
          </Button>
          <Button
            size="sm"
            onClick={toggleEditState}
            variant="outline"
            disabled={isLoading}
          >
            <IconX size={16} />
          </Button>
        </form>
      ) : (
        <h4 className="text-xl font-semibold grow text-foreground" onClick={toggleEditState}>
          {checklistTitle || "Checklist"}
        </h4>
      )}
    </>
  );
}
