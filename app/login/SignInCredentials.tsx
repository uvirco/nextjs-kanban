"use client";
import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useState } from "react";
import { IconMail, IconLock } from "@tabler/icons-react";

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
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        startContent={<IconMail size={18} />}
        required
      />
      <Input
        type="password"
        placeholder="Password (any password works in dev)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        startContent={<IconLock size={18} />}
        required
      />
      <Button
        type="submit"
        color="primary"
        className="w-full"
        isLoading={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
};

export default SignInCredentials;