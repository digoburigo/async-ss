import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { Mail, Trash2, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableBulkActions as BulkActionsToolbar } from "~/components/data-table";
import { sleep } from "~/lib/utils";
import type { User } from "../data/schema";
import { UsersMultiDeleteDialog } from "./users-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkStatusChange = (status: "active" | "inactive") => {
    const selectedUsers = selectedRows.map((row) => row.original as User);
    toast.promise(sleep(2000), {
      loading: `${status === "active" ? "Activating" : "Deactivating"} users...`,
      success: () => {
        table.resetRowSelection();
        return `${status === "active" ? "Activated" : "Deactivated"} ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
      },
      error: `Error ${status === "active" ? "activating" : "deactivating"} users`,
    });
    table.resetRowSelection();
  };

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User);
    toast.promise(sleep(2000), {
      loading: "Inviting users...",
      success: () => {
        table.resetRowSelection();
        return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`;
      },
      error: "Error inviting users",
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar entityName="user" table={table}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Invite selected users"
              className="size-8"
              onClick={handleBulkInvite}
              size="icon"
              title="Invite selected users"
              variant="outline"
            >
              <Mail />
              <span className="sr-only">Invite selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Invite selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Activate selected users"
              className="size-8"
              onClick={() => handleBulkStatusChange("active")}
              size="icon"
              title="Activate selected users"
              variant="outline"
            >
              <UserCheck />
              <span className="sr-only">Activate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Activate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Deactivate selected users"
              className="size-8"
              onClick={() => handleBulkStatusChange("inactive")}
              size="icon"
              title="Deactivate selected users"
              variant="outline"
            >
              <UserX />
              <span className="sr-only">Deactivate selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deactivate selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Delete selected users"
              className="size-8"
              onClick={() => setShowDeleteConfirm(true)}
              size="icon"
              title="Delete selected users"
              variant="destructive"
            >
              <Trash2 />
              <span className="sr-only">Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
        table={table}
      />
    </>
  );
}
