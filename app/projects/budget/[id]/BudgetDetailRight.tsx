"use client";
import React, { useState, useEffect } from "react";
import { BudgetEntry, Comment } from "@/types/types";
import { Tabs, Tab } from "@nextui-org/tabs";
import { supabase } from "@/lib/supabase";
import BudgetCommentsTab from "./BudgetCommentsTab";
import BudgetNotesTab from "./BudgetNotesTab";
import BudgetFilesTab from "./BudgetFilesTab";
import BudgetActivityTab from "./BudgetActivityTab";

interface BudgetDetailRightProps {
  budget: BudgetEntry;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  comments: Comment[];
  onCommentAdded: () => void;
}

export default function BudgetDetailRight({
  budget,
  activeTab,
  setActiveTab,
  comments,
  onCommentAdded,
}: BudgetDetailRightProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes();
    } else if (activeTab === "files") {
      fetchFiles();
    } else if (activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab, budget.id]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("MeetingNote")
      .select("*, user:created_by(id, email, name)")
      .eq("budget_entry_id", budget.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotes(data || []);
    }
  };

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from("Attachment")
      .select("*, user:uploadedBy(id, email, name)")
      .eq("parent_type", "budget_entry")
      .eq("parent_id", budget.id)
      .order("createdAt", { ascending: false });

    if (!error) {
      setFiles(data || []);
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("Activity")
      .select("*, user:userId(id, email, name)")
      .eq("taskId", budget.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setActivities(data || []);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 h-full flex flex-col">
      <Tabs
        aria-label="Budget details"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="p-4"
      >
        <Tab key="overview" title="Overview">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Description</h3>
              <p className="text-zinc-300">{budget.description || "No description"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400">Category</label>
                <p className="text-white">{budget.category}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-400">Amount</label>
                <p className="text-white font-mono">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: budget.currency || "ZAR",
                  }).format(budget.amount)}
                </p>
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="notes" title="Notes">
          <BudgetNotesTab budget={budget} notes={notes} onNoteAdded={fetchNotes} />
        </Tab>

        <Tab key="comments" title="Comments">
          <BudgetCommentsTab
            budgetId={budget.id}
            comments={comments}
            onCommentAdded={onCommentAdded}
          />
        </Tab>

        <Tab key="files" title="Files">
          <BudgetFilesTab budget={budget} files={files} onFileAdded={fetchFiles} />
        </Tab>

        <Tab key="activity" title="Activity">
          <BudgetActivityTab activities={activities} />
        </Tab>
      </Tabs>
    </div>
  );
}
