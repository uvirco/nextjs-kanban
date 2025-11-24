"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
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
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        boardId: parse.data.boardId,
        email: parse.data.userEmail,
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVITATION_ALREADY_SENT,
      };
    }

    // Generate a unique token
    const token = generateUniqueToken();

    // Create a new invitation record
    await prisma.invitation.create({
      data: {
        boardId: parse.data.boardId,
        email: parse.data.userEmail,
        token: token,
        inviterId: loggedInUserId,
      },
    });

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
export async function handleAcceptInvitation({
  token,
}: {
  token: string;
}) {
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
    const invitation = await prisma.invitation.findFirst({
      where: {
        token: parse.data.token,
        email: loggedInUserEmail, // Ensure the invitation is for the logged-in user
      },
    });

    if (!invitation) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVALID_OR_PROCESSED,
      };
    }

    // Check if user is already a member of this board
    const existingMembership = await prisma.boardMember.findFirst({
      where: {
        boardId: invitation.boardId,
        userId: loggedInUserId,
      },
    });

    if (existingMembership) {
      // User is already a member, just delete the invitation
      await prisma.invitation.delete({ where: { id: invitation.id } });
      return { success: true, message: "You are already a member of this board." };
    }

    // Add user to the board members
    await prisma.boardMember.create({
      data: {
        boardId: invitation.boardId,
        userId: loggedInUserId,
        role: "member",
      },
    });

    // Delete the invitation record
    await prisma.invitation.delete({ where: { id: invitation.id } });

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
    const invitation = await prisma.invitation.findUnique({
      where: { token: parse.data.token },
    });

    if (!invitation) {
      return {
        success: false,
        message: MESSAGES.INVITATION.INVALID_OR_PROCESSED,
      };
    }

    // Delete the invitation record
    await prisma.invitation.delete({ where: { id: invitation.id } });

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
    await prisma.invitation.deleteMany({
      where: {
        boardId: parse.data.boardId,
        email: parse.data.email,
      },
    });

    // Generate a unique token
    const token = generateUniqueToken();

    // Create a new invitation record
    await prisma.invitation.create({
      data: {
        boardId: parse.data.boardId,
        email: parse.data.email,
        token: token,
        inviterId: loggedInUserId,
      },
    });

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
    const invitation = await prisma.invitation.findFirst({
      where: {
        boardId: parse.data.boardId,
        email: parse.data.email,
      },
    });

    if (!invitation) {
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
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId: parse.data.boardId,
        userId: loggedInUserId,
        role: "owner",
      },
    });

    if (!boardMember) {
      return {
        success: false,
        message: "You don't have permission to remove users from this board.",
      };
    }

    // Cannot remove the board owner
    const targetUser = await prisma.boardMember.findFirst({
      where: {
        boardId: parse.data.boardId,
        userId: parse.data.userId,
      },
    });

    if (targetUser?.role === "owner") {
      return {
        success: false,
        message: "Cannot remove the board owner.",
      };
    }

    // Remove the user from the board
    await prisma.boardMember.deleteMany({
      where: {
        boardId: parse.data.boardId,
        userId: parse.data.userId,
      },
    });

    revalidatePath(`/board/${parse.data.boardId}`);
    return { success: true, message: "User removed from board successfully." };
  } catch (error) {
    console.error("Failed to remove user from board:", error);
    return { success: false, message: "Failed to remove user from board." };
  }
}
