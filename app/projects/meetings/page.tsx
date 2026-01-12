import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MeetingsPageClient from "./MeetingsPageClient";

export default async function MeetingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <MeetingsPageClient />;
}
