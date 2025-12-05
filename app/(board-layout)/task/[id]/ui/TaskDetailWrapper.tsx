import { Card, CardContent } from "@/components/ui/card";

export default function TaskDetailWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="z-10 bg-zinc-900 border-zinc-800 text-zinc-100">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
