"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import crypto from "crypto";
import { MESSAGES } from "@/utils/messages";

// Utility function to generate a unique token
function generateUniqueToken() {
  return crypto.randomBytes(16).toString("hex");
}

// Send board invitation
export async function handleSendBoardInvitation({
  boardId,
  userEmail,
}: {
  boardId: string;
  userEmail: string;
}) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;

  if (!loggedInUserId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const SendBoardInvitationSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    userEmail: z.string().email(MESSAGES.INVITATION.USER_EMAIL_REQUIRED),
  });

  const data = { boardId, userEmail };
  const parse = SendBoardInvitationSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Check for an existing invitation
    const { data: existingInvitation, error: checkError } = await supabaseAdmin
      .from("Invitation")
      .select("*")
      .eq("boardId", parse.data.boardId)
      .eq("email", parse.data.userEmail)
      .single();

    if (existingInvitation && !checkError) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVITATION_ALREADY_SENT,
      };
    }

    // Generate a unique token
    const token = generateUniqueToken();

    // Create a new invitation record
    const { error: createError } = await supabaseAdmin
      .from("Invitation")
      .insert({
        boardId: parse.data.boardId,
        email: parse.data.userEmail,
        token: token,
        inviterId: loggedInUserId,
      });

    if (createError) {
      console.error("Failed to create invitation:", createError);
      return { success: false, message: MESSAGES.INVITATION.CREATE_FAILURE };
    }

    // Generate the invitation link
    const baseUrl = process.env.AUTH_URL;
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;

    revalidatePath(`/profile/`);

    return {
      success: true,
      message: MESSAGES.INVITATION.CREATE_SUCCESS,
      invitationLink,
    };
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return { success: false, message: MESSAGES.INVITATION.CREATE_FAILURE };
  }
}

// Accept board invitation
export async function handleAcceptInvitation({ token }: { token: string }) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;
  const loggedInUserEmail = session?.user?.email;

  if (!loggedInUserId || !loggedInUserEmail) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const AcceptInvitationSchema = z.object({
    token: z.string().min(1, MESSAGES.INVITATION.TOKEN_REQUIRED),
  });

  const parse = AcceptInvitationSchema.safeParse({ token });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the invitation by token and verify it matches the logged-in user's email
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("Invitation")
      .select("*")
      .eq("token", parse.data.token)
      .eq("email", loggedInUserEmail)
      .single();

    if (!invitation || invitationError) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVALID_OR_PROCESSED,
      };
    }

    // Check if user is already a member of this board
    const { data: existingMembership } = await supabaseAdmin
      .from("BoardMember")
      .select("*")
      .eq("boardId", invitation.boardId)
      .eq("userId", loggedInUserId)
      .single();

    if (existingMembership) {
      // User is already a member, just delete the invitation
      await supabaseAdmin.from("Invitation").delete().eq("id", invitation.id);
      return {
        success: true,
        message: "You are already a member of this board.",
      };
    }

    // Add user to the board members
    const { error: memberError } = await supabaseAdmin
      .from("BoardMember")
      .insert({
        boardId: invitation.boardId,
        userId: loggedInUserId,
        role: "member",
      });

    if (memberError) {
      console.error("Failed to add board member:", memberError);
      return { success: false, message: MESSAGES.INVITATION.ACCEPT_FAILURE };
    }

    // Delete the invitation record
    const { error: deleteError } = await supabaseAdmin
      .from("Invitation")
      .delete()
      .eq("id", invitation.id);

    if (deleteError) {
      console.error("Failed to delete invitation:", deleteError);
    }

    revalidatePath(`/board/`);
    revalidatePath(`/profile/`);

    return { success: true, message: MESSAGES.INVITATION.ACCEPT_SUCCESS };
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return { success: false, message: MESSAGES.INVITATION.ACCEPT_FAILURE };
  }
}

export async function handleRejectInvitation({ token }: { token: string }) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;

  if (!loggedInUserId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const RejectInvitationSchema = z.object({
    token: z.string().min(1, MESSAGES.INVITATION.TOKEN_REQUIRED),
  });

  const parse = RejectInvitationSchema.safeParse({ token });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the invitation by token
    const { data: invitation, error: findError } = await supabaseAdmin
      .from("Invitation")
      .select("*")
      .eq("token", parse.data.token)
      .single();

    if (!invitation || findError) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVALID_OR_PROCESSED,
      };
    }

    // Delete the invitation record
    const { error: deleteError } = await supabaseAdmin
      .from("Invitation")
      .delete()
      .eq("id", invitation.id);

    if (deleteError) {
      console.error("Failed to delete invitation:", deleteError);
      return { success: false, message: MESSAGES.INVITATION.REJECT_FAILURE };
    }

    revalidatePath(`/profile/`);
    return { success: true, message: MESSAGES.INVITATION.REJECT_SUCCESS };
  } catch (error) {
    console.error("Failed to reject invitation:", error);
    return { success: false, message: MESSAGES.INVITATION.REJECT_FAILURE };
  }
}

// Resend invitation (cancel old one and create new)
export async function handleResendInvitation({
  boardId,
  email,
}: {
  boardId: string;
  email: string;
}) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;

  if (!loggedInUserId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const ResendInvitationSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    email: z.string().email(MESSAGES.INVITATION.USER_EMAIL_REQUIRED),
  });

  const data = { boardId, email };
  const parse = ResendInvitationSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Delete existing invitation
    await supabaseAdmin
      .from("Invitation")
      .delete()
      .eq("boardId", parse.data.boardId)
      .eq("email", parse.data.email);

    // Generate a unique token
    const token = generateUniqueToken();

    // Create a new invitation record
    const { error: createError } = await supabaseAdmin
      .from("Invitation")
      .insert({
        boardId: parse.data.boardId,
        email: parse.data.email,
        token: token,
        inviterId: loggedInUserId,
      });

    if (createError) {
      console.error("Failed to resend invitation:", createError);
      return { success: false, message: "Failed to resend invitation." };
    }

    // Generate the invitation link
    const baseUrl = process.env.AUTH_URL;
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;

    revalidatePath(`/profile/`);

    return {
      success: true,
      message: "Invitation resent successfully",
      invitationLink,
    };
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return { success: false, message: "Failed to resend invitation." };
  }
}

// Get invitation link for existing invitation
export async function handleGetInvitationLink({
  boardId,
  email,
}: {
  boardId: string;
  email: string;
}) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;

  if (!loggedInUserId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const GetInvitationLinkSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    email: z.string().email(MESSAGES.INVITATION.USER_EMAIL_REQUIRED),
  });

  const data = { boardId, email };
  const parse = GetInvitationLinkSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the existing invitation
    const { data: invitation, error: findError } = await supabaseAdmin
      .from("Invitation")
      .select("*")
      .eq("boardId", parse.data.boardId)
      .eq("email", parse.data.email)
      .single();

    if (!invitation || findError) {
      return {
        success: false,
        message: "Invitation not found.",
      };
    }

    // Generate the invitation link
    const baseUrl = process.env.AUTH_URL;
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    return {
      success: true,
      invitationLink,
    };
  } catch (error) {
    console.error("Failed to get invitation link:", error);
    return { success: false, message: "Failed to get invitation link." };
  }
}

// Remove user from board
export async function handleRemoveUserFromBoard({
  boardId,
  userId,
}: {
  boardId: string;
  userId: string;
}) {
  const session = await auth();
  const loggedInUserId = session?.user?.id;

  if (!loggedInUserId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const RemoveUserSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    userId: z.string().min(1, "User ID is required"),
  });

  const data = { boardId, userId };
  const parse = RemoveUserSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Check if the logged-in user is the board owner
    const { data: boardMember } = await supabaseAdmin
      .from("BoardMember")
      .select("*")
      .eq("boardId", parse.data.boardId)
      .eq("userId", loggedInUserId)
      .eq("role", "owner")
      .single();

    if (!boardMember) {
      return {
        success: false,
        message: "You don't have permission to remove users from this board.",
      };
    }

    // Cannot remove the board owner
    const { data: targetUser } = await supabaseAdmin
      .from("BoardMember")
      .select("*")
      .eq("boardId", parse.data.boardId)
      .eq("userId", parse.data.userId)
      .single();

    if (targetUser?.role === "owner") {
      return {
        success: false,
        message: "Cannot remove the board owner.",
      };
    }

    // Remove the user from the board
    const { error: removeError } = await supabaseAdmin
      .from("BoardMember")
      .delete()
      .eq("boardId", parse.data.boardId)
      .eq("userId", parse.data.userId);

    if (removeError) {
      console.error("Failed to remove user from board:", removeError);
      return { success: false, message: "Failed to remove user from board." };
    }

    revalidatePath(`/board/${parse.data.boardId}`);
    return { success: true, message: "User removed from board successfully." };
  } catch (error) {
    console.error("Failed to remove user from board:", error);
    return { success: false, message: "Failed to remove user from board." };
  }
}
