"use client";
import { useState } from "react";
import { toast } from "sonner";
import { handleCreateColumn } from "@/server-actions/ColumnServerActions";
import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

export default function CreateColumnForm({ boardId }: { boardId: string }) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset previous validation states
    setIsInvalid(false);
    setErrorMessage("");

    setIsSubmitting(true);
    const response = await handleCreateColumn({ title, boardId });
    setIsSubmitting(false);

    if (response.success) {
      toast.success("Column Created!");
      setTitle("");
      setShowForm(false);
    } else {
      if (response.message) {
        setIsInvalid(true);
        setErrorMessage(response.message);
      }
      toast.error(response.message);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setShowForm(false);
    setIsInvalid(false);
    setErrorMessage("");
  };

  if (!showForm) {
    return (
      <div className="shrink-0 w-64 md:w-72 lg:w-80 ml-2 flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-300 transition-all duration-200 hover:scale-110 shadow-lg"
          title="Add new column"
        >
          <IconPlus size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 w-64 md:w-72 lg:w-80 ml-2">
      <div className="bg-zinc-950 p-3 rounded-xl shadow-md border border-zinc-700">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoComplete="off"
            type="text"
            id="columnTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            size="sm"
            label="Column name"
            placeholder="Enter column name"
            isRequired
            isInvalid={isInvalid}
            errorMessage={errorMessage}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="gap-1 flex-1"
              size="sm"
              variant="flat"
            >
              <IconPlus size={16} />
              Add
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="gap-1"
              size="sm"
              variant="light"
            >
              <IconX size={16} />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
