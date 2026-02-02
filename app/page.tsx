import Link from "next/link";
import {
  IconBrandGithub,
  IconLayoutKanban,
  IconRocket,
  IconBook,
  IconBriefcase,
  IconUsers,
  IconChartLine,
  IconShield,
} from "@tabler/icons-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

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

      <section className="px-3 md:px-10 py-10 pb-20">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Projects Card */}
            <Link
              href={
                session
                  ? "/projects/epics"
                  : "/login?callbackUrl=/projects/epics"
              }
              className="group"
            >
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/50 rounded-xl p-8 hover:border-purple-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 min-h-[340px] flex flex-col justify-between">
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
            <Link
              href={session ? "/crm" : "/login?callbackUrl=/crm"}
              className="group"
            >
              <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border border-indigo-700/50 rounded-xl p-8 hover:border-indigo-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 min-h-[340px] flex flex-col justify-between">
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

            {/* UViRCO Strategy Card */}
            <Link
              href={session ? "/strategy2" : "/login?callbackUrl=/strategy2"}
              className="group"
            >
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-800/20 border border-blue-700/50 rounded-xl p-8 hover:border-blue-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 min-h-[340px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                    <IconChartLine size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    UViRCO Strategy
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    View and manage strategic objectives and goals. Explore the
                    interactive tree view of organizational strategy and align
                    your work with business priorities.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                  <span>View Strategy</span>
                  <IconRocket size={18} />
                </div>
              </div>
            </Link>

            {/* Risk Management Card */}
            <Link
              href={
                session
                  ? "/risk-management"
                  : "/login?callbackUrl=/risk-management"
              }
              className="group"
            >
              <div className="bg-gradient-to-br from-red-900/20 to-orange-800/20 border border-red-700/50 rounded-xl p-8 hover:border-red-600/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 min-h-[340px] flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-red-600/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-600/30 transition-colors">
                    <IconShield size={32} className="text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    Risk Management
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Identify, assess, and mitigate organizational risks. Monitor
                    risk metrics, track mitigation strategies, and ensure
                    compliance with regulatory requirements.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-red-400 font-medium group-hover:text-red-300 transition-colors">
                  <span>Manage Risks</span>
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
