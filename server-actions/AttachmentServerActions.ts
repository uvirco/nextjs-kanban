"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import { MESSAGES } from "@/utils/messages";

// Upload an attachment (file) for a task/epic (taskId refers to Task row which can be a EPIC)
export async function handleUploadAttachment(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const file = formData.get("file") as File | null;
  const taskId = formData.get("taskId")?.toString();

  const schema = z.object({
    taskId: z.string().min(1, "Missing taskId/epicId"),
  });

  const parse = schema.safeParse({ taskId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  try {
    // Build a simple top-level path under the attachments bucket. Use a generated id
    // so files live directly under `attachments/` instead of nested task folders.
    const attachmentId =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `att_${Date.now()}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `attachments/${attachmentId}-${safeName}`;

    // Allow an optional friendly name override coming from the form data
    const displayName = formData.get("name")?.toString() || null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("attachments")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, message: "Failed to upload file" };
    }

    // Insert metadata into Attachment table (store storage_path since bucket is private)
    const { data: created, error: insertError } = await supabaseAdmin
      .from("Attachment")
      .insert({
        id: attachmentId,
        // Use friendly/display name if provided; otherwise use the original file name
        filename: displayName || file.name,
        url: "",
        storage_path: path,
        parent_type: "task",
        parent_id: parse.data.taskId,
        size: file.size,
        mimeType: file.type || null,
        taskId: parse.data.taskId,
        uploadedBy: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert attachment error:", insertError);
      return { success: false, message: "Failed to save attachment metadata" };
    }

    // Revalidate the epic/task page
    revalidatePath(`/epics/${parse.data.taskId}`);
    revalidatePath(`/task/${parse.data.taskId}`);

    return { success: true, attachment: created };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Unexpected error" };
  }
}

export async function handleCreateLinkAttachment(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { success: false, message: MESSAGES.AUTH.REQUIRED };

  const url = formData.get("url")?.toString();
  const name = formData.get("name")?.toString() || url;
  const taskId = formData.get("taskId")?.toString();

  // Ensure URL has protocol
  let processedUrl = url;
  if (processedUrl && !processedUrl.match(/^https?:\/\//)) {
    processedUrl = `https://${processedUrl}`;
  }

  const schema = z.object({
    url: z.string().min(1, "URL is required").url("Invalid URL"),
    taskId: z.string().min(1, "Missing task id"),
  });

  const parse = schema.safeParse({ url: processedUrl, taskId });
  if (!parse.success)
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };

  try {
    const { data: created, error } = await supabaseAdmin
      .from("Attachment")
      .insert({
        filename: name,
        url: processedUrl,
        storage_path: null,
        parent_type: "task",
        parent_id: parse.data.taskId,
        size: null,
        mimeType: "link",
        taskId: parse.data.taskId,
        uploadedBy: userId,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to save link" };
    }

    revalidatePath(`/epics/${parse.data.taskId}`);
    revalidatePath(`/task/${parse.data.taskId}`);

    return { success: true, attachment: created };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to save link" };
  }
}

export async function handleDeleteAttachment({
  id,
  taskId,
}: {
  id: string;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, message: MESSAGES.AUTH.REQUIRED };

  if (!id) return { success: false, message: "Missing attachment id" };

  try {
    // Fetch attachment to see if there's an object in storage to remove
    const { data: existing } = await supabaseAdmin
      .from("Attachment")
      .select("id, storage_path")
      .eq("id", id)
      .single();

    // If there's a storage_path, try removing the object from the attachments bucket
    if (existing?.storage_path) {
      try {
        const { error: removeErr } = await supabaseAdmin.storage
          .from("attachments")
          .remove([existing.storage_path]);
        if (removeErr) {
          // log but continue — metadata should still be deletable
          console.error("Failed to remove storage object:", removeErr);
        }
      } catch (e) {
        console.error("Unexpected error removing storage object", e);
      }
    }

    const { error } = await supabaseAdmin
      .from("Attachment")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      return { success: false, message: "Failed to delete attachment" };
    }

    if (taskId) {
      revalidatePath(`/epics/${taskId}`);
      revalidatePath(`/task/${taskId}`);
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to delete attachment" };
  }
}

export async function handleGetSignedUrl({
  attachmentId,
}: {
  attachmentId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, message: MESSAGES.AUTH.REQUIRED };

  if (!attachmentId)
    return { success: false, message: "Missing attachment id" };

  try {
    const { data: att, error } = await supabaseAdmin
      .from("Attachment")
      .select("id, url, storage_path, mimeType")
      .eq("id", attachmentId)
      .single();

    if (error || !att) {
      console.error(error);
      return { success: false, message: "Attachment not found" };
    }

    // If this is a link, return the stored url directly
    // If the record is a user-provided link, return it directly
    if (att.mimeType === "link" && att.url) {
      return { success: true, url: att.url };
    }

    // If the record doesn't have storage_path but has a stored URL (legacy/public), return that
    if (!att.storage_path && att.url) {
      return { success: true, url: att.url };
    }

    if (!att.storage_path) {
      return {
        success: false,
        message: "No file path available for this attachment",
      };
    }

    // create signed URL (60 seconds TTL)
    const { data: signedData, error: signedErr } = await supabaseAdmin.storage
      .from("attachments")
      .createSignedUrl(att.storage_path, 60);

    if (signedErr) {
      console.error("Error creating signed url:", signedErr);
      return { success: false, message: "Failed to generate download URL" };
    }

    return { success: true, url: (signedData as any)?.signedUrl };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to generate signed URL" };
  }
}
