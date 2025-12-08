import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import BoardPageClient from "./components/BoardPageClient";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BoardWithColumns } from "@/types/types";

// Force dynamic rendering to ensure filters work on URL changes
export const dynamic = 'force-dynamic';

interface EpicFilters {
  priority?: string | null;
  assigneeId?: string | null;
  columnId?: string | null;
  dueDateFilter?: string | null;
  departmentId?: string | null;
  businessValue?: string | null;
  riskLevel?: string | null;
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ labels?: string; epicId?: string; departmentId?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!userId) {
    return <div>User not authenticated</div>;
  }

  const { id } = await params;
  const { labels, epicId, departmentId } = await searchParams;

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

    // Parse filters from searchParams
    const labelFilter = labels?.split(",") || [];
    const selectedEpicId = epicId || null;
    const selectedDepartmentId = departmentId || null;

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
        .map((ua: any) => ({
          userId: ua.userId,
          taskId: ua.taskId,
          user: ua.user,
        })),
    }));

    // Group tasks by column
    const columnsWithTasks = (columnsData || []).map((column: any) => ({
      ...column,
      tasks: enrichedTasks.filter((task: any) => task.columnId === column.id),
    }));

    // Apply label filter if needed
    if (labelFilter.length > 0) {
      columnsWithTasks.forEach((column: any) => {
        column.tasks = column.tasks.filter((task: any) =>
          task.labels?.some((label: any) => labelFilter.includes(label.id))
        );
      });
    }

    // Apply epic filter if needed
    if (selectedEpicId) {
      columnsWithTasks.forEach((column: any) => {
        column.tasks = column.tasks.filter((task: any) => {
          return task.parentTaskId === selectedEpicId || task.id === selectedEpicId;
        });
      });
    }

    // Apply department filter if needed
    if (selectedDepartmentId) {
      columnsWithTasks.forEach((column: any) => {
        column.tasks = column.tasks.filter((task: any) => task.departmentId === selectedDepartmentId);
      });
    }

    // Fetch all epic tasks (taskType = 'EPIC') for the filter dropdown
    let epicQuery = supabaseAdmin
      .from("Task")
      .select("id, title")
      .in("columnId", columnIds)
      .eq("taskType", "EPIC");

    if (selectedDepartmentId) {
      epicQuery = epicQuery.eq("departmentId", selectedDepartmentId);
    }

    const { data: epicTasks } = await epicQuery
      .order("title", { ascending: true });

    // Fetch departments for the filter dropdown
    const { data: departments } = await supabaseAdmin
      .from("Department")
      .select("id, name")
      .order("name", { ascending: true });

    // Check if board is favorited by current user
    const { data: favoriteData } = await supabaseAdmin
      .from("UserFavoriteBoard")
      .select("userId")
      .eq("boardId", id)
      .eq("userId", userId)
      .single();

    const isFavorite = !!favoriteData;

    // Fetch labels for the board
    const { data: boardLabels } = await supabaseAdmin
      .from("Label")
      .select("*")
      .eq("boardId", id);

    // Fetch board members
    const { data: boardMembersData } = await supabaseAdmin
      .from("BoardMember")
      .select(
        `
      *,
      user:User (*)
    `
      )
      .eq("boardId", id);

    const boardMembers = (boardMembersData || []);
    const owner = boardMembers.find((member: any) => member.role === "owner")?.user ?? null;
    const isOwner = owner?.id === userId;
    const members = boardMembers.filter((member: any) => member.role === "member");

    const board: BoardWithColumns = {
      ...boardBasic,
      columns: columnsWithTasks,
    };

    return (
      <BoardPageClient 
        board={board} 
        isFavorite={isFavorite} 
        boardLabels={boardLabels || []} 
        owner={owner}
        members={members}
        isOwner={isOwner}
        loggedInUserId={userId}
        epicTasks={epicTasks || []}
        selectedEpicId={selectedEpicId}
        departments={departments || []}
        selectedDepartmentId={selectedDepartmentId}
      />
    );
  } catch (error) {
    console.error("Error loading board:", error);
    return <div>Failed to load board</div>;
  }
}
