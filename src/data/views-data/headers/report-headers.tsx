import { EventReport } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@dayjs";
import { DATE_FORMAT, DATE_TIME_FORMAT } from "@/data";
import { Button } from "@/components/ui/button";
import { ExcelIcon } from "@/assets";

interface ReportHeadersParam {
  onDownload: (report: EventReport) => void;
}

export function reportHeaders(
  param: ReportHeadersParam
): ColumnDef<EventReport>[] {
  return [
    {
      header: "Event Name",
      accessorKey: "eventName",
    },
    {
      header: "Event Date",
      accessorKey: "startDate",
      cell({ getValue }) {
        return dayjs(getValue() as string).format(DATE_FORMAT);
      },
    },
    {
      header: "Last Update",
      accessorKey: "lastUpdate",
      cell({ getValue }) {
        return dayjs(getValue() as string).format(DATE_TIME_FORMAT);
      },
    },
    {
      header: "Action",
      cell({ row }) {
        return (
          <Button
            onClick={() => {
              if (param.onDownload) param.onDownload(row.original);
            }}
            className={
              "h-full bg-sidebar-accent hover:bg-sidebar-accent text-[--sidebar-accent-foreground] [&>svg]:fill-current [&>path]:fill-current"
            }
          >
            <ExcelIcon height={24} width={24} />
          </Button>
        );
      },
    },
  ];
}
