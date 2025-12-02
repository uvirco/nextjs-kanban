import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import EditEpicForm from "./EditEpicForm";

async function getEpic(epicId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Import supabaseAdmin here to avoid issues
  const { supabaseAdmin } = await import("@/lib/supabase");

  const { data: epic, error } = await supabaseAdmin
    .from("Task")
    .select("*")
    .eq("id", epicId)
    .eq("taskType", "EPIC")
    .single();

  if (error || !epic) {
    return null;
  }

  // Fetch current epic members
  const { data: members } = await supabaseAdmin
    .from("EpicMember")
    .select(
      `
      id,
      role,
      createdAt,
      user:User (
        id,
        name,
        email,
        image
      )
    `
    )
    .eq("epicId", epicId)
    .order("createdAt", { ascending: true });

  return {
    ...epic,
    members: members || [],
  };
}

export default async function EditEpicPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const epic = await getEpic(params.id);

  if (!epic) {
    redirect("/epics");
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/epics/${epic.id}`}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <IconArrowLeft size={20} />
            Back to Epic
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <span className="text-2xl">✏️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Epic</h1>
              <p className="text-zinc-400 mt-1">
                Update epic details, priorities, and planning information.
              </p>
            </div>
          </div>

          <EditEpicForm epic={epic} initialMembers={epic.members} />
        </div>
      </div>
    </div>
  );
}
