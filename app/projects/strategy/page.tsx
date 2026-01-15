import Link from "next/link";
import {
  IconBook,
  IconTarget,
  IconCalendar,
  IconUsers,
  IconTrendingUp,
  IconSettings,
} from "@tabler/icons-react";

export default function StrategyIndexPage() {
  const documentationSections = [
    {
      title: "Overview",
      description:
        "Introduction to our agile methodology and how this tool supports it",
      slug: "overview",
      icon: <IconBook stroke={1.5} size={24} />,
      category: "Getting Started",
    },
    {
      title: "Sprint Planning",
      description: "How to plan and execute effective sprints using this tool",
      slug: "sprint-planning",
      icon: <IconTarget stroke={1.5} size={24} />,
      category: "Sprint Management",
    },
    {
      title: "Daily Standups",
      description:
        "Best practices for daily standup meetings and progress tracking",
      slug: "daily-standups",
      icon: <IconCalendar stroke={1.5} size={24} />,
      category: "Sprint Management",
    },
    {
      title: "Epic Management",
      description:
        "Managing large-scale features and initiatives across multiple sprints",
      slug: "epic-management",
      icon: <IconTrendingUp stroke={1.5} size={24} />,
      category: "Project Organization",
    },
    {
      title: "Task Estimation",
      description:
        "Techniques for accurate task estimation and capacity planning",
      slug: "task-estimation",
      icon: <IconSettings stroke={1.5} size={24} />,
      category: "Planning",
    },
    {
      title: "Team Collaboration",
      description:
        "Collaboration features and best practices for distributed teams",
      slug: "team-collaboration",
      icon: <IconUsers stroke={1.5} size={24} />,
      category: "Collaboration",
    },
  ];

  const categories = [
    ...new Set(documentationSections.map((section) => section.category)),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <IconBook stroke={1.5} size={32} />
          Agile Strategy Documentation
        </h1>
        <p className="text-zinc-400 text-lg">
          Comprehensive guide to using this tool within the Agile/Scrum
          methodology. Learn how to plan sprints, manage epics, track progress,
          and collaborate effectively.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 border-b border-zinc-700 pb-2">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentationSections
              .filter((section) => section.category === category)
              .map((section) => (
                <Link
                  key={section.slug}
                  href={`/projects/strategy/${section.slug}`}
                  className="block p-6 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all duration-200 group hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-12 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Can't find what you're looking for? Check out our additional resources
          or contact the team.
        </p>
        <div className="flex gap-4">
          <Link
            href="/projects"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            ← Back to Projects
          </Link>
          <span className="text-zinc-600">|</span>
          <Link
            href="/projects/meetings"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View Meetings →
          </Link>
        </div>
      </div>
    </div>
  );
}
