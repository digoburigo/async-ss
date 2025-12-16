import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";
import type { Product } from "@acme/zen-v3/zenstack/models";
import type { Table } from "@tanstack/react-table";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableBulkActions as BulkActionsToolbar } from "~/components/data-table";
import { ProductsMultiDeleteDialog } from "./products-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkExport = () => {
    const selectedProducts = selectedRows.map((row) => row.original as Product);
    toast.promise(
      new Promise((resolve) => {
        // Simulate export
        setTimeout(() => {
          console.log("Exporting products:", selectedProducts);
          resolve(undefined);
        }, 500);
      }),
      {
        loading: "Exportando produtos...",
        success: () => {
          table.resetRowSelection();
          return `Exportados ${selectedProducts.length} produto${selectedProducts.length > 1 ? "s" : ""} para CSV.`;
        },
        error: "Erro ao exportar",
      }
    );
    table.resetRowSelection();
  };

  return (
    <>
      <BulkActionsToolbar entityName="produto" table={table}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Exportar produtos"
              className="size-8"
              onClick={() => handleBulkExport()}
              size="icon"
              title="Exportar produtos"
              variant="outline"
            >
              <Download />
              <span className="sr-only">Exportar produtos</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Exportar produtos</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Excluir produtos selecionados"
              className="size-8"
              onClick={() => setShowDeleteConfirm(true)}
              size="icon"
              title="Excluir produtos selecionados"
              variant="destructive"
            >
              <Trash2 />
              <span className="sr-only">Excluir produtos selecionados</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Excluir produtos selecionados</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ProductsMultiDeleteDialog
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
        table={table}
      />
    </>
  );
}
