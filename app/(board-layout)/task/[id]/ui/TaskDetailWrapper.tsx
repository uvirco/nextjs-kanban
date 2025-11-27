import { Card, CardContent } from "@/components/ui/card";

export default function TaskDetailWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="z-10 bg-card text-card-foreground border-border">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
