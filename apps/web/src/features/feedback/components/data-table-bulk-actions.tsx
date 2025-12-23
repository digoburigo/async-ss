import { Button } from "@acme/ui/button";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useQueryClient } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DataTableBulkActionsProps {
  table: Table<CitizenFeedback>;
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const client = useClientQueries(schema);

  const { mutateAsync: deleteFeedback } = client.citizenFeedback.useDelete();

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedRows.map((row) =>
          deleteFeedback({
            where: { id: row.original.id },
          })
        )
      );
      toast.success(`${selectedRows.length} feedbacks excluidos com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      table.resetRowSelection();
    } catch {
      toast.error("Erro ao excluir feedbacks");
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedRows.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background p-2 shadow-lg sm:bottom-8"
      role="toolbar"
    >
      <span className="px-2 text-muted-foreground text-sm">
        {selectedRows.length} selecionado(s)
      </span>
      <Button
        disabled={isDeleting}
        onClick={handleBulkDelete}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? "Excluindo..." : "Excluir"}
      </Button>
    </div>
  );
}
