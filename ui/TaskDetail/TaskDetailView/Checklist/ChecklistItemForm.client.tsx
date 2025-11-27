"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { handleCreateChecklistItem } from "@/server-actions/ChecklistServerActions";
import { toast } from "sonner";

interface ChecklistItemFormProps {
  checklistId: string;
  taskId: string;
}

export default function ChecklistItemForm({
  checklistId,
  taskId,
}: ChecklistItemFormProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleInput = () => setShowInput(!showInput);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const data = { content: inputValue, checklistId, taskId };

    const response = await handleCreateChecklistItem(data);
    if (response.success) {
      setInputValue("");
      toggleInput();
      toast.success(response.message);
    } else {
      setError(response.message);
      toast.error(response.message);
    }
    setIsLoading(false);
  };

  return (
    <div>
      {!showInput && (
        <Button size="sm" onClick={toggleInput} variant="outline">
          Add an item
        </Button>
      )}
      {showInput && (
        <form onSubmit={handleSubmit}>
          <Input
            autoComplete="off"
            placeholder="Add an item..."
            name="content"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full mb-2"
            autoFocus
            required
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
            >
              Add Item
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={toggleInput}
              variant="outline"
              disabled={isLoading}
            >
              <IconX size={16} />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
