import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@acme/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { showSubmittedData } from "~/lib/show-submitted-data";
import type { ChatUser } from "../data/chat-types";

type User = Omit<ChatUser, "messages">;

type NewChatProps = {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export function NewChat({ users, onOpenChange, open }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSelectUser = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      handleRemoveUser(user.id);
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    // Reset selected users when dialog closes
    if (!newOpen) {
      setSelectedUsers([]);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="items-baseline-last flex flex-wrap gap-2">
            <span className="min-h-6 text-muted-foreground text-sm">To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="default">
                {user.fullName}
                <button
                  className="ms-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemoveUser(user.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemoveUser(user.id);
                    }
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <Command className="rounded-lg border">
            <CommandInput
              className="text-foreground"
              placeholder="Search people..."
            />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    className="flex items-center justify-between gap-2 hover:bg-accent hover:text-accent-foreground"
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        alt={user.fullName}
                        className="h-8 w-8 rounded-full"
                        src={user.profile || "/placeholder.svg"}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {user.fullName}
                        </span>
                        <span className="text-accent-foreground/70 text-xs">
                          {user.username}
                        </span>
                      </div>
                    </div>

                    {selectedUsers.find((u) => u.id === user.id) && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <Button
            disabled={selectedUsers.length === 0}
            onClick={() => showSubmittedData(selectedUsers)}
            variant={"default"}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
