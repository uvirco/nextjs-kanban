interface TaskDetailWrapperProps {
  children: React.ReactNode;
}

export default function TaskDetailWrapper({
  children,
}: TaskDetailWrapperProps) {
  return <div className="flex flex-col h-full">{children}</div>;
}
