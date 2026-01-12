"use client";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { IconCheck, IconShare, IconX } from "@tabler/icons-react";
import {
  handleRejectInvitation,
  handleAcceptInvitation,
  handleResendInvitation as resendInvitation,
} from "@/server-actions/InvitationServerActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@nextui-org/react";

interface Invitation {
  id: string;
  token: string;
  board: {
    title: string;
    id: string;
  };
  inviter: {
    name: string | null;
    email: string | null;
  };
}

interface SentInvitation {
  id: string;
  email: string;
  token: string;
  board: {
    title: string;
    id: string;
  };
}

export function ProfileInviteReceivedActions({
  invite,
}: {
  invite: Invitation;
}) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async (token: string) => {
    setIsAccepting(true);
    try {
      const result = await handleAcceptInvitation({ token });
      if (result.success) {
        toast.success(result.message);
        router.push(`/board/${invite.board.id}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while accepting the invitation.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (token: string) => {
    if (window.confirm("Are you sure you want to reject this invitation?")) {
      setIsRejecting(true);
      try {
        const result = await handleRejectInvitation({ token });
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred while rejecting the invitation.");
      } finally {
        setIsRejecting(false);
      }
    }
  };

  return (
    <li className="border-b-1 last:border-b-0 border-zinc-700 py-1">
      <p className="mb-1">
        Invited to Board <strong>{invite.board.title}</strong> by{" "}
        <strong>{invite.inviter.name ?? "Unknown"}</strong> (
        {invite.inviter.email ?? "No Email"}) -{" "}
        <Link
          className="text-primary"
          href={`/accept-invitation/?token=${invite.token}`}
        >
          View
        </Link>
      </p>
      <div className="flex gap-3">
        <Button
          size="sm"
          onClick={() => handleAccept(invite.token)}
          isLoading={isAccepting}
          className="flex items-center"
        >
          <IconCheck size={16} />
          Accept
        </Button>
        <Button
          size="sm"
          onClick={() => handleReject(invite.token)}
          isLoading={isRejecting}
          className="flex items-center"
        >
          <IconX size={16} />
          Reject
        </Button>
      </div>
    </li>
  );
}

export function ProfileInviteSentActions({
  invite,
}: {
  invite: SentInvitation;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCancelInvitation = async (token: string) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      setIsCancelling(true);
      try {
        const result = await handleRejectInvitation({ token });
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to cancel invitation.");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleResendInvitation = async (boardId: string, email: string) => {
    setIsResending(true);
    try {
      const result = await resendInvitation({ boardId, email });
      if (result.success) {
        toast.success("Invitation resent successfully!");
        // The page will revalidate and show the new invitation
        window.location.reload();
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      toast.error("Failed to resend invitation.");
    } finally {
      setIsResending(false);
    }
  };

  const invitationLink = `${process.env.NEXT_PUBLIC_AUTH_URL}/accept-invitation?token=${invite.token}`;

  return (
    <div className="border-b-1 last:border-b-0 border-zinc-700 py-2">
      <div className="flex gap-1 items-start flex-wrap">
        <button
          className="text-danger hover:bg-red-500 rounded p-1 mt-1"
          onClick={() => handleCancelInvitation(invite.token)}
          title="Cancel invitation"
        >
          {isCancelling ? (
            <Spinner size="sm" color="danger" />
          ) : (
            <IconX size={18} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            Sent to <strong>{invite.email}</strong> for Board{" "}
            <strong>{invite.board.title}</strong>
          </p>
          <div className="mt-1 p-2 bg-zinc-800 rounded text-xs font-mono break-all">
            {invitationLink}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => handleResendInvitation(invite.board.id, invite.email)}
            disabled={isResending}
            className="text-green-500 hover:text-green-300 p-1 rounded disabled:opacity-50"
            title="Resend invitation with new link"
          >
            {isResending ? (
              <Spinner size="sm" color="success" />
            ) : (
              "Resend"
            )}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(invitationLink);
              toast.success("Invitation link copied to clipboard!");
            }}
            className="text-blue-500 hover:text-blue-300 p-1 rounded"
            title="Copy invitation link"
          >
            <IconShare size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
