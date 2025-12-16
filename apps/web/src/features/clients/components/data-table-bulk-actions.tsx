import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";
import type { Client } from "@acme/zen-v3/zenstack/models";
import type { Table } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataTableBulkActions as BulkActionsToolbar } from "~/components/data-table";
import { ClientsMultiDeleteDialog } from "./clients-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkExport = () => {
    const selectedClients = selectedRows.map((row) => row.original as Client);
    toast.promise(
      new Promise((resolve) => {
        // Simulate export
        setTimeout(() => {
          console.log("Exporting clients:", selectedClients);
          resolve(undefined);
        }, 500);
      }),
      {
        loading: "Exportando clientes...",
        success: () => {
          table.resetRowSelection();
          return `Exportados ${selectedClients.length} cliente${selectedClients.length > 1 ? "s" : ""} para CSV.`;
        },
        error: "Erro ao exportar",
      }
    );
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar entityName="cliente" table={table}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Exportar clientes"
              className="size-8"
              onClick={() => handleBulkExport()}
              size="icon"
              title="Exportar clientes"
              variant="outline"
            >
              <Download />
              <span className="sr-only">Exportar clientes</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar clientes</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Excluir clientes selecionados"
              className="size-8"
              onClick={() => setShowDeleteConfirm(true)}
              size="icon"
              title="Excluir clientes selecionados"
              variant="destructive"
            >
              <Trash2 />
              <span className="sr-only">Excluir clientes selecionados</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir clientes selecionados</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ClientsMultiDeleteDialog
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
        table={table}
      />
    </>
  );
}
