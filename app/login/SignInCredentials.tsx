"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { IconMail, IconLock, IconLoader2 } from "@tabler/icons-react";

const SignInCredentials = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/board",
        redirect: false,
      });

      if (result?.error) {
        alert("Login failed. Please try again.");
      } else {
        window.location.href = "/board";
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <IconMail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="relative">
        <IconLock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
        <input
          type="password"
          placeholder="Password (any password works in dev)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
      >
        {isLoading ? (
          <>
            <IconLoader2 size={16} className="animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default SignInCredentials;