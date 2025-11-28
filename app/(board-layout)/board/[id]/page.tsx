import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Board from "./components/Board";
import BoardNavbar from "./components/Navbar/BoardNavbar";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BoardWithColumns } from "@/types/types";

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ labels?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!userId) {
    return <div>User not authenticated</div>;
  }

  const { id } = await params;
  const { labels } = await searchParams;

  try {
    // Admins can access all boards
    if (userRole !== "ADMIN") {
      // Check if user is a member of the board
      const { data: isMember, error: memberError } = await supabaseAdmin
        .from("BoardMember")
        .select("role")
        .eq("boardId", id)
        .eq("userId", userId)
        .single();

      // Redirect to board list if user is not a member
      if (memberError || !isMember) {
        redirect("/board");
      }
    }

    // Parse labels from searchParams
    const labelFilter = labels?.split(",") || [];

    // Fetch the board
    const { data: boardBasic, error: boardBasicError } = await supabaseAdmin
      .from("Board")
      .select("id, title, backgroundUrl, createdAt, updatedAt")
      .eq("id", id)
      .single();

    if (boardBasicError || !boardBasic) {
      return <div>Board not found</div>;
    }

    // Fetch columns with tasks
    const { data: columnsData, error: columnsError } = await supabaseAdmin
      .from("Column")
      .select("*")
      .eq("boardId", id)
      .order("order", { ascending: true });

    if (columnsError) {
      return <div>Error loading board</div>;
    }

    // Fetch all tasks for the board columns
    const columnIds = (columnsData || []).map((col: any) => col.id);
    const { data: tasksData } = await supabaseAdmin
      .from("Task")
      .select("*")
      .in("columnId", columnIds)
      .order("order", { ascending: true });

    // Fetch label assignments for all tasks
    const taskIds = (tasksData || []).map((t: any) => t.id);
    const { data: labelAssignments } = await supabaseAdmin
      .from("LabelOnTask")
      .select("taskId, labelId, label:Label(*)")
      .in("taskId", taskIds);

    // Fetch user assignments for all tasks
    const { data: userAssignments } = await supabaseAdmin
      .from("TaskAssignment")
      .select("userId, taskId, user:User(id, name, email)")
      .in("taskId", taskIds);

    // Build tasks with their labels and assigned users
    const enrichedTasks = (tasksData || []).map((task: any) => ({
      ...task,
      labels: (labelAssignments || [])
        .filter((la: any) => la.taskId === task.id)
        .map((la: any) => la.label),
      assignedUsers: (userAssignments || [])
        .filter((ua: any) => ua.taskId === task.id)
        .map((ua: any) => ({ userId: ua.userId, taskId: ua.taskId, user: ua.user }))
    }));

    // Group tasks by column
    const columnsWithTasks = (columnsData || []).map((column: any) => ({
      ...column,
      tasks: enrichedTasks.filter((task: any) => task.columnId === column.id)
    }));

    // Apply label filter if needed
    if (labelFilter.length > 0) {
      columnsWithTasks.forEach((column: any) => {
        column.tasks = column.tasks.filter((task: any) =>
          task.labels?.some((label: any) => labelFilter.includes(label.id))
        );
      });
    }

    const board: BoardWithColumns = {
      ...boardBasic,
      columns: columnsWithTasks
    };

    return (
      <main className="flex flex-col grow min-w-0 bg-cover bg-center bg-zinc-900 relative">
        {board.backgroundUrl && (
          <Image
            className="object-cover object-center z-0"
            src={board.backgroundUrl}
            alt="Board Wallpaper"
            fill
          />
        )}
        <BoardNavbar boardId={board.id} boardTitle={board.title} />
        <Board board={board} />
      </main>
    );
  } catch (error) {
    console.error("Error loading board:", error);
    return <div>Failed to load board</div>;
  }
}
