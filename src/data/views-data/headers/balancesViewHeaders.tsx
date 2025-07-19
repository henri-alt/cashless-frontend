import { ColumnDef } from "@tanstack/react-table";
import { BalanceType } from "@/types";
import dayjs from "@dayjs";
import { Trash2 } from "lucide-react";
import { DATE_TIME_FORMAT } from "@/data";

interface BalanceHeadersParam {
  onDelete: (balance: BalanceType) => void;
}

export function balancesViewHeaders(
  param: BalanceHeadersParam
): ColumnDef<BalanceType>[] {
  return [
    {
      header: "Ticket Id",
      accessorKey: "ticketId",
    },
    {
      header: "Scan Id",
      accessorKey: "scanId",
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
      header: "Created By",
      accessorKey: "createdBy",
    },
    {
      header: "Activation Amount",
      accessorKey: "initialAmount",
      cell(props) {
        const val = Number(props.getValue()) || 0;
        return Number(val.toFixed(2)).toLocaleString();
      },
    },
    {
      header: "Activation Currency",
      accessorKey: "activationCurrency",
    },
    {
      header: "Activation Fee",
      accessorKey: "activationCost",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const date = row?.original?.createdAt;
        if (date) {
          return dayjs(date).format(DATE_TIME_FORMAT);
        } else {
          return null;
        }
      },
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            param.onDelete(row.original);
          }}
        >
          <Trash2 className="h-6 w-6" />
        </div>
      ),
    },
  ];
}
