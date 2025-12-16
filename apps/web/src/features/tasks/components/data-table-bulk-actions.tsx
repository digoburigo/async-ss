import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";
import type { Table } from "@tanstack/react-table";
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableBulkActions as BulkActionsToolbar } from "~/components/data-table";
import { sleep } from "~/lib/utils";
import { priorities, statuses } from "../data/data";
import type { Task } from "../data/schema";
import { TasksMultiDeleteDialog } from "./tasks-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task);
    toast.promise(sleep(2000), {
      loading: "Updating status...",
      success: () => {
        table.resetRowSelection();
        return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  const handleBulkPriorityChange = (priority: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task);
    toast.promise(sleep(2000), {
      loading: "Updating priority...",
      success: () => {
        table.resetRowSelection();
        return `Priority updated to "${priority}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  const handleBulkExport = () => {
    const selectedTasks = selectedRows.map((row) => row.original as Task);
    toast.promise(sleep(2000), {
      loading: "Exporting tasks...",
      success: () => {
        table.resetRowSelection();
        return `Exported ${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""} to CSV.`;
      },
      error: "Error",
    });
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar entityName="task" table={table}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Update status"
                  className="size-8"
                  size="icon"
                  title="Update status"
                  variant="outline"
                >
                  <CircleArrowUp />
                  <span className="sr-only">Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                defaultValue={status.value}
                key={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className="size-4 text-muted-foreground" />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Update priority"
                  className="size-8"
                  size="icon"
                  title="Update priority"
                  variant="outline"
                >
                  <ArrowUpDown />
                  <span className="sr-only">Update priority</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update priority</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                defaultValue={priority.value}
                key={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
              >
                {priority.icon && (
                  <priority.icon className="size-4 text-muted-foreground" />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Export tasks"
              className="size-8"
              onClick={() => handleBulkExport()}
              size="icon"
              title="Export tasks"
              variant="outline"
            >
              <Download />
              <span className="sr-only">Export tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export tasks</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Delete selected tasks"
              className="size-8"
              onClick={() => setShowDeleteConfirm(true)}
              size="icon"
              title="Delete selected tasks"
              variant="destructive"
            >
              <Trash2 />
              <span className="sr-only">Delete selected tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
        table={table}
      />
    </>
  );
}
