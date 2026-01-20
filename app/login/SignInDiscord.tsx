"use client";
import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/button";
import { IconBrandDiscord } from "@tabler/icons-react";

const SignInDiscord = () => {
  return (
    <Button
      onClick={() => signIn("discord", { callbackUrl: "/projects/epics" })}
      type="button"
      variant="ghost"
      isDisabled
    >
      <IconBrandDiscord size={20} />
      Sign In With Discord
    </Button>
  );
};

export default SignInDiscord;
