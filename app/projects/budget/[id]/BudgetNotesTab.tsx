"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { BudgetEntry } from "@/types/types";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface BudgetNotesTabProps {
  budget: BudgetEntry;
  notes: any[];
  onNoteAdded: () => void;
}

export default function BudgetNotesTab({
  budget,
  notes,
  onNoteAdded,
}: BudgetNotesTabProps) {
  const { data: session } = useSession();
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("MeetingNote").insert([
        {
          budget_entry_id: budget.id,
          content: newNote,
          created_by: session.user.id,
          type: "budget",
        },
      ]);

      if (error) {
        console.error("Error adding note:", error);
        toast.error("Failed to add note");
      } else {
        toast.success("Note added");
        setNewNote("");
        onNoteAdded();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error adding note");
    }
    setIsSubmitting(false);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* Add Note */}
      <div className="border-b border-zinc-700 pb-4">
        <h3 className="font-semibold text-white mb-2">Add Note</h3>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          className="mb-2"
          minRows={3}
        />
        <Button
          onClick={handleAddNote}
          isLoading={isSubmitting}
          disabled={isSubmitting || !newNote.trim()}
          size="sm"
        >
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-zinc-400 text-sm">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-zinc-800/50 rounded p-3 border border-zinc-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">
                    {note.user?.name || note.user?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(note.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
