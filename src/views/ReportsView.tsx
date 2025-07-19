import { useContext, useEffect, useRef, useMemo } from "react";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { DynamicTableRefType } from "@/components/dynamic-table/dynamic-table";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";
import { useQuery } from "@tanstack/react-query";
import { reportHeaders } from "@/data/views-data/headers/report-headers";
import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { ColumnDef } from "@tanstack/react-table";
import { useAnalyticsApi } from "@/services/api";

function ReportsView() {
  const { updatePageProps } = useContext(AuthContext);
  const { getAllReports, getEventReport } = useAnalyticsApi();

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["reports"],
    queryFn: getAllReports,
  });

  const tableRef = useRef<DynamicTableRefType>(null);

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps({
      title: "Reports",
      hasSearch: true,
      hasExports: false,
      hasNew: false,
      customTitle: null,
      showTitle: true,
      hasFilter: false,
      onSearch(search) {
        if (!tableRef.current) return;
        tableRef.current.tableApi.setGlobalFilter(search);
      },
      customHeaderActions: (
        <Button
          onClick={() => {
            refetch();
          }}
          className="[&>path]:fill-current [&>svg]:fill-current"
        >
          <RefreshIcon />
        </Button>
      ),
    });
  }, [updatePageProps, refetch]);

  const headerColumns = useMemo(() => {
    return reportHeaders({
      onDownload(report) {
        getEventReport.mutate({
          eventId: report.eventId,
        });
      },
    });
  }, [getEventReport]);

  return (
    <DynamicTable
      headerColumns={headerColumns as ColumnDef<unknown>[]}
      tableData={data || []}
      isLoading={isFetching}
      ref={tableRef}
      rowId="exportId"
    />
  );
}

export default ReportsView;
