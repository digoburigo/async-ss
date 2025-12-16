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
import { activeStatuses } from "../data/data";
import { DataTableBulkActions } from "./data-table-bulk-actions";
import { productsColumns as columns } from "./products-columns";

const route = getRouteApi("/_authenticated/products/");

export function ProductsTable() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const client = useClientQueries(schema);
  const { data: products = [], isFetching } = client.product.useFindMany(
    {},
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
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: "filter" },
    columnFilters: [
      { columnId: "category", searchKey: "category", type: "array" },
      { columnId: "active", searchKey: "active", type: "array" },
    ],
  });

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  ).map((cat) => ({
    label: cat,
    value: cat,
  }));

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
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
      const code = String(row.getValue("code")).toLowerCase();
      const name = String(row.getValue("name")).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();

      return code.includes(searchValue) || name.includes(searchValue);
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
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        "flex flex-1 flex-col gap-4"
      )}
    >
      <DataTableToolbar
        filters={[
          {
            columnId: "category",
            title: "Categoria",
            options: categories,
          },
          {
            columnId: "active",
            title: "Status",
            options: activeStatuses.map((s) => ({
              label: s.label,
              value: s.value,
            })),
          },
        ]}
        searchPlaceholder="Filtrar por código ou nome..."
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
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
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
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
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
                  Nenhum resultado.
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
