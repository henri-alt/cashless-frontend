import { TransactionType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@dayjs";
import { DATE_TIME_FORMAT } from "@/data";

export const transactionHeaders: ColumnDef<TransactionType>[] = [
  {
    header: "Product",
    accessorKey: "itemName",
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
  },
  {
    header: "Scan Id",
    accessorKey: "scanId",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell(props) {
      const val = Number(props.getValue()) || 0;
      return Number(val.toFixed(2)).toLocaleString();
    },
  },
  {
    header: "Date",
    accessorKey: "transactionDate",
    cell({ row }) {
      const date = row.getValue("transactionDate") as string;
      return dayjs(date).format(DATE_TIME_FORMAT);
    },
  },
  {
    header: "Member",
    accessorKey: "memberName",
  },
];
