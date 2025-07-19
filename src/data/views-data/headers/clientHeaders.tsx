import { DataTableRowActions } from "@/components/view-components/menu-row-options";
import { ClientRow } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@dayjs";
import { DATE_TIME_FORMAT } from "@/data";

interface ClientHeaderParam {
  onDelete: (client: ClientRow) => void;
  onEdit: (client: ClientRow) => void;
}

export function clientHeaders(
  param: ClientHeaderParam
): ColumnDef<ClientRow>[] {
  return [
    { header: "Name", accessorKey: "clientName" },
    { header: "Email", accessorKey: "clientEmail" },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        if (row?.original?.createdAt) {
          const date = dayjs(row?.original?.createdAt).format(DATE_TIME_FORMAT);
          return date;
        } else {
          return null;
        }
      },
    },
    {
      header: "Balance",
      accessorKey: "balance",
      cell(props) {
        const val = Number(props.getValue()) || 0;
        return Number(val.toFixed(2)).toLocaleString();
      },
    },
    {
      header: "Balance Currency",
      accessorKey: "eventCurrency",
    },
    {
      header: "Amount Spent",
      accessorKey: "amountSpent",
      cell(props) {
        const val = Number(props.getValue()) || 0;
        return Number(val.toFixed(2)).toLocaleString();
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onEdit={() => {
            param.onEdit(row.original);
          }}
          onRemove={() => {
            param.onDelete(row.original);
          }}
        />
      ),
    },
  ];
}
