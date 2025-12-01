"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

export function SignInButton() {
  return <button onClick={() => signIn()}>Sign In</button>;
}

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return <Button onClick={handleSignOut}>Sign Out</Button>;
}
