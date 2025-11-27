"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleCreateBoard } from "@/server-actions/BoardServerActions";
import { IconLoader2, IconPlus } from "@tabler/icons-react";

export default function CreateBoardForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsInvalid(false);
    setErrorMessage("");

    setIsSubmitting(true);
    const response = await handleCreateBoard({ title });
    setIsSubmitting(false);

    if (response.success && response.boardId) {
      router.push(`/board/${response.boardId}`);
      toast.success("Board Created!");
    } else {
      if (response.message) {
        setIsInvalid(true);
        setErrorMessage(response.message);
      }
      toast.error(response.message);
    }
  };

  return (
    <div className="p-3 bg-zinc-950 rounded-xl shadow-xl h-32">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full justify-between"
      >
        <div className="flex flex-col">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-300 mb-1"
          >
            Create a new board
          </label>
          <input
            autoComplete="off"
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter board name"
            className={`px-3 py-2 text-sm bg-zinc-900 border rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isInvalid ? "border-red-500" : "border-zinc-700"
            }`}
            required
          />
          {isInvalid && errorMessage && (
            <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
          )}
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? (
              <IconLoader2 size={16} className="shrink-0 animate-spin" />
            ) : (
              <IconPlus size={16} className="shrink-0" />
            )}
            Create Board
          </button>
        </div>
      </form>
    </div>
  );
}
