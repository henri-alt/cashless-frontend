import { TopUp } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@dayjs";
import { DATE_TIME_FORMAT } from "@/data";

export const topUpHeaders: ColumnDef<TopUp>[] = [
  {
    header: "Member",
    accessorKey: "memberName",
  },
  {
    header: "Amount",
    accessorKey: "topUpAmount",
    cell(props) {
      const val = Number(props.getValue()) || 0;
      return Number(val.toFixed(2)).toLocaleString();
    },
  },
  {
    header: "Scan Id",
    accessorKey: "scanId",
  },
  {
    header: "Currency",
    accessorKey: "topUpCurrency",
  },
  {
    header: "Created At",
    accessorKey: "topUpDate",
    cell: ({ row }) => {
      const date = row?.original?.topUpDate;
      if (date) {
        return dayjs(date).format(DATE_TIME_FORMAT);
      } else {
        return null;
      }
    },
  },
];
