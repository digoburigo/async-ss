import { Badge } from "@acme/ui/badge";
import { Checkbox } from "@acme/ui/checkbox";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DataTableColumnHeader } from "~/components/data-table";
import { getPriorityOption, getStatusOption } from "../data/data";
import { DataTableRowActions } from "./data-table-row-actions";

export const feedbackColumns: ColumnDef<CitizenFeedback>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Selecionar todos"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Selecionar linha"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "w-12",
    },
  },
  {
    accessorKey: "referenceNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Protocolo" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.getValue("referenceNumber") || "-"}
      </span>
    ),
    meta: {
      className: "w-32",
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titulo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = getStatusOption(row.getValue("status"));
      if (!status) return null;

      return (
        <Badge className="whitespace-nowrap" variant="outline">
          <span className={`mr-1.5 h-2 w-2 rounded-full ${status.color}`} />
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    meta: {
      className: "w-36",
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridade" />
    ),
    cell: ({ row }) => {
      const priority = getPriorityOption(row.getValue("priority"));
      if (!priority) return null;

      return (
        <Badge variant="outline">
          <span className={`mr-1.5 h-2 w-2 rounded-full ${priority.color}`} />
          {priority.label}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    meta: {
      className: "w-28",
    },
  },
  {
    accessorKey: "categoryId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoria" />
    ),
    cell: ({ row }) => {
      const category = (row.original as any).category;
      return category ? (
        <span className="text-sm">{category.name}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    meta: {
      className: "w-36",
    },
  },
  {
    accessorKey: "neighborhood",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bairro" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("neighborhood") || "-"}</span>
    ),
    meta: {
      className: "w-32",
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <span className="whitespace-nowrap text-sm">
          {format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      );
    },
    meta: {
      className: "w-36",
    },
  },
  {
    accessorKey: "slaBreached",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SLA" />
    ),
    cell: ({ row }) => {
      const breached = row.getValue("slaBreached") as boolean;
      return breached ? (
        <Badge variant="destructive">Atrasado</Badge>
      ) : (
        <Badge className="border-green-600 text-green-600" variant="outline">
          No prazo
        </Badge>
      );
    },
    meta: {
      className: "w-24",
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: "w-12",
    },
  },
];
