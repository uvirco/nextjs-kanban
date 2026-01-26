import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Redirect to new dashboard location
  redirect("/projects/dashboard");
}
