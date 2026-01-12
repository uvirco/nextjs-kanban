import Link from "next/link";
import {
  IconBrandGithub,
  IconLayoutKanban,
  IconRocket,
  IconBook,
  IconBriefcase,
  IconUsers,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white">
      <nav className="px-3 md:px-10 py-3 mb-5 flex justify-between items-center">
        <h4 className="flex items-center text-lg gap-3 font-semibold tracking-tight">
          <IconLayoutKanban className="text-purple-500" /> TaskManager
        </h4>
        <Link href="https://github.com/greengem/nextjs-kanban">
          <IconBrandGithub />
        </Link>
      </nav>

      <section className="px-3 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to{" "}
              <span className="from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-b">
                TaskManager
              </span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Choose your workspace to get started with project management and
              CRM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Projects Card */}
            <Link href="/projects/epics" className="group">
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50 rounded-xl p-8 hover:border-purple-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 min-h-[320px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600/30 transition-colors">
                    <IconBriefcase size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    Projects
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Manage epics, tasks, and kanban boards. Track progress,
                    collaborate with your team, and deliver projects on time
                    with comprehensive project management tools.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                  <span>Go to Projects</span>
                  <IconRocket size={18} />
                </div>
              </div>
            </Link>

            {/* CRM Card */}
            <Link href="/crm" className="group">
              <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border border-indigo-700/50 rounded-xl p-8 hover:border-indigo-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 min-h-[320px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600/30 transition-colors">
                    <IconUsers size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">CRM</h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Manage contacts, deals, and sales pipeline. Track customer
                    relationships, monitor opportunities, and grow your business
                    with powerful CRM features.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
                  <span>Go to CRM</span>
                  <IconRocket size={18} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
