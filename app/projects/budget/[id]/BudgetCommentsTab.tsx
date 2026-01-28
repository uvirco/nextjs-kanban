"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Comment } from "@/types/types";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface BudgetCommentsTabProps {
  budgetId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export default function BudgetCommentsTab({
  budgetId,
  comments,
  onCommentAdded,
}: BudgetCommentsTabProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!session?.user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("Comment").insert([
        {
          parent_type: "budget_entry",
          parent_id: budgetId,
          user_id: session.user.id,
          content: newComment,
          is_edited: false,
        },
      ]);

      if (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
      } else {
        toast.success("Comment added");
        setNewComment("");
        onCommentAdded();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error adding comment");
    }
    setIsSubmitting(false);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* Add Comment */}
      <div className="border-b border-zinc-700 pb-4">
        <h3 className="font-semibold text-white mb-2">Add Comment</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="mb-2"
          minRows={3}
        />
        <Button
          onClick={handleAddComment}
          isLoading={isSubmitting}
          disabled={isSubmitting || !newComment.trim()}
          size="sm"
        >
          Post Comment
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-zinc-400 text-sm">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-zinc-800/50 rounded p-3 border border-zinc-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">
                    {comment.user?.name || comment.user?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDate(comment.created_at)}
                    {comment.is_edited && " (edited)"}
                  </p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
