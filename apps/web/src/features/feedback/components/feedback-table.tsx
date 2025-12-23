"use no memo";

import { cn } from "@acme/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { getRouteApi } from "@tanstack/react-router";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { useEffect, useState } from "react";

import { authClient } from "~/clients/auth-client";
import { DataTablePagination, DataTableToolbar } from "~/components/data-table";
import { useTableUrlState } from "~/hooks/use-table-url-state";
import { priorityOptions, statusOptions } from "../data/data";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { feedbackColumns as columns } from "./feedback-columns";

const route = getRouteApi("/_authenticated/feedback/" as any);

export function FeedbackTable() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const client = useClientQueries(schema);
  const { data: feedbacks = [], isFetching } =
    client.citizenFeedback.useFindMany(
      {
        include: {
          category: true,
          subcategory: true,
          department: true,
          assignedTo: true,
        },
        orderBy: { createdAt: "desc" },
      },
      {
        enabled: !!activeOrganization?.id,
      }
    );

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch() as any,
    navigate: route.useNavigate() as any,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [
      { columnId: "status", searchKey: "status", type: "array" },
      { columnId: "priority", searchKey: "priority", type: "array" },
    ],
  });

  const table = useReactTable({
    data: feedbacks,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const title = String(row.getValue("title")).toLowerCase();
      const referenceNumber = String(
        row.getValue("referenceNumber") ?? ""
      ).toLowerCase();
      const neighborhood = String(
        row.getValue("neighborhood") ?? ""
      ).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();

      return (
        title.includes(searchValue) ||
        referenceNumber.includes(searchValue) ||
        neighborhood.includes(searchValue)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  });

  const pageCount = table.getPageCount();
  useEffect(() => {
    ensurePageInRange(pageCount);
  }, [pageCount, ensurePageInRange]);

  if (isFetching) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <p>Carregando feedbacks...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        "flex flex-1 flex-col gap-4"
      )}
    >
      <DataTableToolbar
        filters={[
          {
            columnId: "status",
            title: "Status",
            options: statusOptions.map((s) => ({
              label: s.label,
              value: s.value,
            })),
          },
          {
            columnId: "priority",
            title: "Prioridade",
            options: priorityOptions.map((p) => ({
              label: p.label,
              value: p.value,
            })),
          },
        ]}
        searchPlaceholder="Filtrar por titulo, protocolo ou bairro..."
        table={table}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={cn(
                      (header.column.columnDef.meta as any)?.className,
                      (header.column.columnDef.meta as any)?.thClassName
                    )}
                    colSpan={header.colSpan}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={cn(
                        (cell.column.columnDef.meta as any)?.className,
                        (cell.column.columnDef.meta as any)?.tdClassName
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  Nenhum feedback encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination className="mt-auto" table={table} />
      <DataTableBulkActions table={table} />
    </div>
  );
}
