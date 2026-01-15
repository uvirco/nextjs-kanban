import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconBook } from "@tabler/icons-react";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

interface StrategyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Frontmatter {
  title: string;
  description: string;
  category?: string;
}

async function getStrategyContent(slug: string) {
  const contentDir = path.join(process.cwd(), "content", "strategy");
  const filePath = path.join(contentDir, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);

    const contentHtml = processedContent.toString();

    return {
      frontmatter: data as Frontmatter,
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error reading strategy content for ${slug}:`, error);
    return null;
  }
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { slug } = await params;
  const content = await getStrategyContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/projects/strategy"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <IconArrowLeft stroke={1.5} size={16} />
          Back to Documentation
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <IconBook stroke={1.5} size={32} className="text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">
              {content.frontmatter.title}
            </h1>
            {content.frontmatter.category && (
              <span className="inline-block px-2 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-md mt-2">
                {content.frontmatter.category}
              </span>
            )}
          </div>
        </div>

        {content.frontmatter.description && (
          <p className="text-zinc-400 text-lg">
            {content.frontmatter.description}
          </p>
        )}
      </div>

      <div className="prose prose-invert prose-lg max-w-none [&_blockquote]:border-l-blue-500 [&_blockquote]:border-l-4 [&_blockquote]:bg-blue-500/10 [&_blockquote]:p-4 [&_blockquote]:rounded-r-md [&_blockquote]:my-6 [&_blockquote_p]:text-zinc-200 [&_h2]:border-b-2 [&_h2]:border-zinc-700 [&_h2]:pb-2 [&_h2]:mb-4 [&_h3]:text-blue-400 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:pl-6 [&_li]:mb-1 [&_strong]:text-zinc-100]">
        <div
          dangerouslySetInnerHTML={{ __html: content.content }}
          className="text-zinc-300 leading-relaxed space-y-6"
        />
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 pt-8 border-t border-zinc-800">
        <div className="flex justify-between items-center">
          <Link
            href="/projects/strategy"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Documentation Index
          </Link>
          <div className="text-zinc-500 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all strategy pages
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "content", "strategy");

  try {
    const files = fs.readdirSync(contentDir);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(".md", ""),
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
