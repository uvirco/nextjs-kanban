import Link from "next/link";
import {
  IconBrandGithub,
  IconLayoutKanban,
  IconRocket,
  IconBook,
} from "@tabler/icons-react";
import Image from "next/image";
export default function Home() {

  return (
    <main className="min-h-dvh text-white bg-gradient-to-br from-black to-zinc-900 dark">
      <nav className="px-3 md:px-10 py-3 mb-5 flex justify-between items-center">
        <h4 className="flex items-center text-lg gap-3 font-semibold tracking-tight">
          <IconLayoutKanban className="text-purple-500" /> TaskManager
        </h4>
        <Link href="https://github.com/greengem/nextjs-kanban">
          <IconBrandGithub />
        </Link>
      </nav>

      <section className="mb-10 py-5 px-3 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col justify-center">
            <h4 className="text-lg font-semibold mb-5 text-zinc-500 flex items-center gap-1">
              Project Management
            </h4>
            <h1 className="text-4xl md:text-6xl xl:text-8xl tracking-tighter font-bold mb-5">
              Plan Track and View
              <br />
              <span className="from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-b">
                Uvirco Projects
              </span>
            </h1>
            <p className="text-lg text-zinc-500 mb-5">
              The perfect <strong>solution</strong> to all of your task
              management needs,{" "}
              <span className="text-purple-500">powered by AI</span>
            </p>
            <div className="flex gap-5">
              <Link href="/board">
                <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md flex items-center gap-2">
                  <IconRocket />
                  Get Started
                </button>
              </Link>
              <button className="bg-muted text-muted-foreground cursor-not-allowed h-10 px-4 py-2 rounded-md flex items-center gap-2" disabled>
                <IconBook />
                Docs (Coming Soon)
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <Image
              src="/ss.webp"
              alt="Screenshot of NextBoard"
              width={2000}
              height={1250}
              className="w-full h-auto rounded-xl shadow-xl"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
