import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { IconLayoutKanban } from "@tabler/icons-react";
import SignInCredentials from "./SignInCredentials";

export default async function CustomSignInPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  } else {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        
        {/* Login card */}
        <div className="relative z-10 min-w-96 shadow-2xl bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
          <div className="relative">
            <div className="px-10 py-8 flex items-center border-b border-purple-500/20">
              <IconLayoutKanban className="text-purple-400 w-8 h-8 md:w-10 md:h-10" />
              <h3 className="text-3xl md:text-4xl tracking-tight text-center w-full font-bold bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">
                Uvirco Projects
              </h3>
            </div>
            <div className="space-y-3 p-10">
              <div className="space-y-4">
                <div>
                  <p className="uppercase text-xs text-center text-purple-300 mb-4 font-semibold tracking-widest">
                    Sign In
                  </p>
                  <SignInCredentials />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
