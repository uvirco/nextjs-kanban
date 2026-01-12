import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { toast } from "sonner";
import { handleSendBoardInvitation, handleResendInvitation, handleGetInvitationLink } from "@/server-actions/InvitationServerActions";

export default function BoardAddUsersForm({
  boardId,
  isOwner,
  onInvitationLinkChange,
}: {
  boardId: string;
  isOwner: boolean;
  onInvitationLinkChange: (link: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingInvitation, setExistingInvitation] = useState<{ link: string } | null>(null);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setExistingInvitation(null);

    try {
      const response = await handleSendBoardInvitation({
        boardId,
        userEmail: email,
      });

      if (response.success && response.invitationLink) {
        onInvitationLinkChange(response.invitationLink);
        toast.success(response.message);
        setEmail("");
      } else {
        // Check if it's an "already sent" error
        if (response.message.includes("already been sent")) {
          // Try to get the existing invitation link
          const existingResponse = await handleGetInvitationLink({
            boardId,
            email,
          });
          if (existingResponse.success && existingResponse.invitationLink) {
            setExistingInvitation({ link: existingResponse.invitationLink });
            setError("An invitation has already been sent to this email. You can view or resend it below.");
          } else {
            setError(response.message);
          }
        } else {
          setError(response.message);
        }
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      toast.error("An error occurred while creating the invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const response = await handleResendInvitation({
        boardId,
        email,
      });

      if (response.success && response.invitationLink) {
        setExistingInvitation({ link: response.invitationLink });
        onInvitationLinkChange(response.invitationLink);
        toast.success("Invitation resent with new link!");
        setError("");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (existingInvitation?.link) {
      navigator.clipboard.writeText(existingInvitation.link);
      toast.success("Invitation link copied to clipboard!");
    }
  };

  if (isOwner) {
    return (
      <div className="space-y-2">
        <form onSubmit={handleInvite}>
          <Input
            autoComplete="off"
            variant="bordered"
            size="sm"
            label="Email"
            placeholder="Invite by email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!error && !existingInvitation}
            errorMessage={!existingInvitation ? error : ""}
          />
          <Button
            className="w-full mt-2"
            size="sm"
            type="submit"
            color="primary"
            isLoading={isLoading}
            disabled={!!existingInvitation}
          >
            Send invite
          </Button>
        </form>

        {existingInvitation && (
          <div className="mt-3 p-3 bg-zinc-800 rounded-lg border border-zinc-600">
            <p className="text-sm text-yellow-400 mb-2">
              {error}
            </p>
            <div className="space-y-2">
              <div className="p-2 bg-zinc-900 rounded text-xs font-mono break-all">
                {existingInvitation.link}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  Copy Link
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleResend}
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Resend
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <p className="text-danger">Only board owners can invite new users.</p>
    );
  }
}
