import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { DetailedTask, BoardMemberWithUser } from "@/types/types";
import AddToCardLabels from "./Labels/AddToCardLabels";
import AddToCardDates from "./Dates/AddToCardDates";
import AddChecklist from "./Checklist/AddChecklist";
import AddToCardMembers from "./Members/AddToCardMembers";

export default async function TaskDetailAddToCard({
  task,
}: {
  task: DetailedTask;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const boardId = task.column.boardId;

  if (!userId) {
    return <div>User not authenticated</div>;
  }

  const { data: boardMembersData, error: membersError } = await supabaseAdmin
    .from("BoardMember")
    .select(`
      *,
      user:User (*)
    `)
    .eq("boardId", boardId);

  if (membersError) {
    console.error("Failed to fetch board members:", membersError);
  }

  const boardMembers: BoardMemberWithUser[] = boardMembersData as BoardMemberWithUser[] || [];

  const { data: labels, error: labelsError } = await supabaseAdmin
    .from("Label")
    .select("*")
    .eq("boardId", boardId);

  if (labelsError) {
    console.error("Failed to fetch labels:", labelsError);
  }

  return (
    <div className="mb-5">
      <h4 className="text-sm text-muted-foreground font-semibold mb-1">
        Add to card
      </h4>

      <ul className="text-sm space-y-2">
        <AddToCardMembers
          boardMembers={boardMembers}
          cardMembers={task.assignedUsers}
          taskId={task.id}
          boardId={task.column.boardId}
        />
        <AddToCardLabels
          labels={labels || []}
          taskId={task.id}
          activeLabels={task.labels}
          boardId={task.column.boardId}
        />
        <AddChecklist taskId={task.id} boardId={task.column.boardId} />
        <AddToCardDates
          taskId={task.id}
          boardId={task.column.boardId}
          startDate={task.startDate}
          dueDate={task.dueDate}
        />

        {/*
          <li className='flex items-center gap-2 bg-zinc-800 px-2 py-2 rounded-md'><IconPaperclip size={14} /> Attachement</li>
          <li className='flex items-center gap-2 bg-zinc-800 px-2 py-2 rounded-md'><IconPaint size={14} /> Cover</li>
        */}
      </ul>
    </div>
  );
}
