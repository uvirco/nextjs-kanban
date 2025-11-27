import { Card, CardContent } from "@/components/ui/card";

export default function TaskDetailWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="z-10">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
