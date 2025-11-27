export default function TaskPopoverSubtitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h4 className="uppercase font-semibold text-xs text-muted-foreground mb-1">
      {children}
    </h4>
  );
}
