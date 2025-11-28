import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInGithub from "./SignInGithub";
import { IconLayoutKanban } from "@tabler/icons-react";
import SignInGoogle from "./SignInGoogle";
import SignInDiscord from "./SignInDiscord";
import SignInCredentials from "./SignInCredentials";

export default async function CustomSignInPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  } else {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="min-w-96 shadow-xl bg-zinc-900 border-2 border-primary rounded-lg">
          <div className="px-10 py-5 flex items-center">
            <IconLayoutKanban className="text-primary w-8 h-8 md:w-14 md:h-14" />
            <h3 className="text-3xl md:text-5xl tracking-tighter text-center w-full font-bold">
              Next Kanban
            </h3>
          </div>
          <div className="space-y-3 p-10 pt-0">
            <div className="space-y-4">
              <div>
                <p className="uppercase text-xs text-center text-primary mb-2">
                  Development Login
                </p>
                <SignInCredentials />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
              <p className="uppercase text-xs text-center text-primary">
                OAuth Providers
              </p>
              <SignInGithub />
              <SignInGoogle />
              <SignInDiscord />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
