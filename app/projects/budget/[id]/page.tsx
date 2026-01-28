"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { BudgetEntry, Comment } from "@/types/types";
import { Button } from "@nextui-org/button";
import { Tabs, Tab } from "@nextui-org/tabs";
import { toast } from "sonner";
import BudgetDetailLeft from "./BudgetDetailLeft";
import BudgetDetailRight from "./BudgetDetailRight";

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const budgetId = params.id as string;

  const [budget, setBudget] = useState<BudgetEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (budget && session?.user?.id) {
      checkEditPermission();
    }
  }, [budget?.id, session?.user?.id]);

  const checkEditPermission = () => {
    if (!session?.user?.id || !budget?.created_by) {
      console.log("Missing session user ID or budget created_by", {
        userId: session?.user?.id,
        createdBy: budget?.created_by,
      });
      setCanEdit(false);
      return;
    }

    // Check if current user is the budget creator
    const isCreator = session.user.id === budget.created_by;
    console.log("Permission check:", {
      currentUserId: session.user.id,
      budgetCreatedBy: budget.created_by,
      isCreator: isCreator,
    });

    setCanEdit(isCreator);
  };

  useEffect(() => {
    fetchBudgetDetails();
    fetchComments();
  }, [budgetId]);

  const fetchBudgetDetails = async () => {
    const { data, error } = await supabase
      .from("budget_entries")
      .select(
        "*, epic:Task!epic_id(id, title), department:Department!department_id(id, name)"
      )
      .eq("id", budgetId)
      .single();

    if (error) {
      console.error("Error fetching budget:", error);
      toast.error("Failed to load budget entry");
      router.push("/projects/budget");
    } else {
      // Fetch user separately if created_by is set
      if (data?.created_by) {
        const { data: users } = await supabase
          .from("auth.users")
          .select("id, email, user_metadata")
          .eq("id", data.created_by);

        if (users && users.length > 0) {
          const user = users[0];
          data.user = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "Unknown",
          };
        }
      }
      setBudget(data);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("Comment")
      .select("*, user:user_id(id, email, name)")
      .eq("parent_type", "budget_entry")
      .eq("parent_id", budgetId)
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data || []);
    }
  };

  if (loading) {
    return <div className="p-6">Loading budget entry...</div>;
  }

  if (!budget) {
    return <div className="p-6">Budget entry not found</div>;
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-4">
        <Button
          variant="light"
          onClick={() => router.push("/projects/budget")}
        >
          ← Back to Budget
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-150px)]">
        {/* Left Panel - Budget Details */}
        <div className="col-span-1">
          <BudgetDetailLeft budget={budget} canEdit={canEdit} onUpdate={fetchBudgetDetails} />
        </div>

        {/* Right Panel - Tabs */}
        <div className="col-span-2">
          <BudgetDetailRight
            budget={budget}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            comments={comments}
            onCommentAdded={fetchComments}
          />
        </div>
      </div>
    </div>
  );
}
