import { auth } from "@/auth";
import { DetailedTask } from "@/types/types";
import TaskDetailDescription from "./Description/TaskDetaillDescription";
import TaskDetailActivity from "./Activity/TaskDetailActivity";
import TaskDetailChecklist from "./Checklist/TaskDetailChecklist";
import TaskDetailDates from "./Dates/TaskDetailDates";
import TaskDetailLabels from "./Labels/TaskDetailLabels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default async function TaskDetailView({ task }: { task: DetailedTask }) {
  const session = await auth();

  return (
    <div className="col-span-3">
      {task.assignedUsers.length > 0 && (
        <div className="flex -space-x-2 mb-4">
          {task.assignedUsers.map((assignment) => (
            <Avatar key={assignment.user.id} className="w-8 h-8 border-2 border-white">
              <AvatarImage src={assignment.user.image || undefined} alt={assignment.user.name || "Unknown"} />
              <AvatarFallback className="text-xs">
                {(assignment.user.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}

      <TaskDetailLabels labels={task.labels} />
      <TaskDetailDates startDate={task.startDate} dueDate={task.dueDate} />
      <TaskDetailDescription
        taskDescription={task.description}
        taskId={task.id}
        boardId={task.column.boardId}
      />
      <TaskDetailChecklist taskId={task.id} checklists={task.checklists} />

      <Accordion type="single" collapsible className="w-full mb-4">
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm font-medium">
            Advanced Options
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-xs font-medium">
                  Project Name
                </Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  defaultValue={task.projectName || ""}
                  className="h-8"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-medium">
                  Department
                </Label>
                <Input
                  id="department"
                  placeholder="Enter department"
                  defaultValue={task.department || ""}
                  className="h-8"
                />
              </div>

              {/* Business Value */}
              <div className="space-y-2">
                <Label htmlFor="businessValue" className="text-xs font-medium">
                  Business Value (1-10)
                </Label>
                <Input
                  id="businessValue"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  defaultValue={task.businessValue || ""}
                  className="h-8"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-xs font-medium">
                  Priority
                </Label>
                <Select defaultValue={task.priority || "MEDIUM"}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-medium">
                  Status
                </Label>
                <Select defaultValue={task.status || "TODO"}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated Effort */}
              <div className="space-y-2">
                <Label htmlFor="estimatedEffort" className="text-xs font-medium">
                  Estimated Effort (days)
                </Label>
                <Input
                  id="estimatedEffort"
                  type="number"
                  step="0.5"
                  placeholder="0.0"
                  defaultValue={task.estimatedEffort || ""}
                  className="h-8"
                />
              </div>

              {/* Budget Estimate */}
              <div className="space-y-2">
                <Label htmlFor="budgetEstimate" className="text-xs font-medium">
                  Budget Estimate
                </Label>
                <Input
                  id="budgetEstimate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={task.budgetEstimate || ""}
                  className="h-8"
                />
              </div>

              {/* Risk Level */}
              <div className="space-y-2">
                <Label htmlFor="riskLevel" className="text-xs font-medium">
                  Risk Level
                </Label>
                <Select defaultValue={task.riskLevel || "LOW"}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ROI Estimate */}
              <div className="space-y-2">
                <Label htmlFor="roiEstimate" className="text-xs font-medium">
                  ROI Estimate (%)
                </Label>
                <Input
                  id="roiEstimate"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  defaultValue={task.roiEstimate || ""}
                  className="h-8"
                />
              </div>
            </div>

            {/* Full-width fields */}
            <div className="space-y-4">
              {/* Strategic Alignment */}
              <div className="space-y-2">
                <Label htmlFor="strategicAlignment" className="text-xs font-medium">
                  Strategic Alignment
                </Label>
                <Input
                  id="strategicAlignment"
                  placeholder="Strategic alignment details"
                  defaultValue={task.strategicAlignment || ""}
                  className="h-8"
                />
              </div>

              {/* Stage Gate */}
              <div className="space-y-2">
                <Label htmlFor="stageGate" className="text-xs font-medium">
                  Stage Gate
                </Label>
                <Select defaultValue={task.stageGate || ""}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                    <SelectItem value="TESTING">Testing</SelectItem>
                    <SelectItem value="LAUNCH">Launch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes and comments"
                  defaultValue={task.notes || ""}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <TaskDetailActivity
        taskId={task.id}
        boardId={task.column.boardId}
        activities={task.activities}
        columnTitle={task.column.title}
        userName={session?.user?.name ?? null}
        userImage={session?.user?.image ?? null}
      />
    </div>
  );
}
