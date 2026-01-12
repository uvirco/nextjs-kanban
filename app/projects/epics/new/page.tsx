import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import CreateEpicForm from "./CreateEpicForm";

export default async function NewEpicPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/projects/epics"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <IconArrowLeft size={20} />
            Back to Epic Portfolio
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <IconPlus size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Epic</h1>
              <p className="text-zinc-400 mt-1">
                Start with just a name and description. Add details, RACI roles,
                and stakeholders as you plan the epic.
              </p>
            </div>
          </div>

          <CreateEpicForm boards={[]} userId={userId} />
        </div>
      </div>
    </div>
  );
}
