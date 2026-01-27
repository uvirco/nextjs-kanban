import { supabaseAdmin } from "./supabase";
import { ActivityType } from "@/types/types";

interface ActivityLogInput {
  type: ActivityType;
  content: string;
  userId: string;
  taskId?: string;
  boardId?: string;
  oldColumnId?: string;
  newColumnId?: string;
  originalColumnId?: string;
  targetUserId?: string;
  startDate?: string;
  dueDate?: string;
}

/**
 * Centralized activity logging service
 * Logs user actions across the application for audit trail and activity feed
 */
export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    console.log("logActivity called with:", { type: input.type, userId: input.userId, taskId: input.taskId });
    
    const { data, error } = await supabaseAdmin.from("Activity").insert({
      type: input.type,
      content: input.content,
      userId: input.userId,
      taskId: input.taskId || null,
      boardId: input.boardId || null,
      oldColumnId: input.oldColumnId || null,
      newColumnId: input.newColumnId || null,
      originalColumnId: input.originalColumnId || null,
      targetUserId: input.targetUserId || null,
      startDate: input.startDate || null,
      dueDate: input.dueDate || null,
    });

    if (error) {
      console.error("Failed to log activity - Database Error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      // Don't throw - we don't want to fail the main operation if logging fails
    } else {
      console.log("Activity logged successfully:", data);
    }
  } catch (error) {
    console.error("Activity logging error:", error);
    // Silently fail - logging should never break the main flow
  }
}

/**
 * Helper to format activity content messages
 */
export function formatActivityContent(params: {
  action: string;
  userName: string;
  entityType: string;
  entityName: string;
  details?: string;
}): string {
  const { action, userName, entityType, entityName, details } = params;
  
  let message = `${userName} ${action} ${entityType} "${entityName}"`;
  if (details) {
    message += ` ${details}`;
  }
  
  return message;
}

/**
 * Get activity icon based on type
 */
export function getActivityIcon(type: ActivityType): string {
  const iconMap: Record<ActivityType, string> = {
    TASK_CREATED: "plus-circle",
    TASK_UPDATED: "edit",
    TASK_MOVED: "arrows-right",
    TASK_DELETED: "trash",
    COMMENT_ADDED: "message-circle",
    BOARD_UPDATED: "layout",
    START_DATE_ADDED: "calendar-plus",
    START_DATE_UPDATED: "calendar-event",
    START_DATE_REMOVED: "calendar-minus",
    DUE_DATE_ADDED: "calendar-plus",
    DUE_DATE_UPDATED: "calendar-event",
    DUE_DATE_REMOVED: "calendar-minus",
    TASK_ASSIGNED: "user-plus",
    TASK_UNASSIGNED: "user-minus",
    EPIC_CREATED: "plus-circle",
    EPIC_UPDATED: "edit",
    MEETING_NOTE_ADDED: "note",
    QUICK_NOTE_ADDED: "file-text",
  };

  return iconMap[type] || "activity";
}

/**
 * Get activity color based on type
 */
export function getActivityColor(type: ActivityType): string {
  const colorMap: Record<ActivityType, string> = {
    TASK_CREATED: "text-green-400",
    TASK_UPDATED: "text-blue-400",
    TASK_MOVED: "text-purple-400",
    TASK_DELETED: "text-red-400",
    COMMENT_ADDED: "text-yellow-400",
    BOARD_UPDATED: "text-blue-400",
    START_DATE_ADDED: "text-green-400",
    START_DATE_UPDATED: "text-blue-400",
    START_DATE_REMOVED: "text-red-400",
    DUE_DATE_ADDED: "text-green-400",
    DUE_DATE_UPDATED: "text-blue-400",
    DUE_DATE_REMOVED: "text-red-400",
    TASK_ASSIGNED: "text-green-400",
    TASK_UNASSIGNED: "text-red-400",
    EPIC_CREATED: "text-purple-400",
    EPIC_UPDATED: "text-blue-400",
    MEETING_NOTE_ADDED: "text-blue-400",
    QUICK_NOTE_ADDED: "text-cyan-400",
  };

  return colorMap[type] || "text-zinc-400";
}
