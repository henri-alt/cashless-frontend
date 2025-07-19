import { useEffect, useRef, useContext, useMemo } from "react";
import {
  useQueryClient,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useTransactionsApi } from "@/services/api";
import {
  DynamicTable,
  DynamicTableRefType,
} from "@/components/dynamic-table/dynamic-table";
import { transactionHeaders } from "@/data/views-data/headers/transactionsHeaders";
import { ColumnDef } from "@tanstack/react-table";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import useStore from "@/store";
import { transactionFilters } from "@/data/views-data/filters/transactions-filters";
import { ItemConfig, StaffMember } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";

function TransactionsView() {
  const { eventId } = useParams();
  const { updatePageProps } = useContext(AuthContext);
  const { filters, pagination, setPagination } = useStore();

  const queryClient = useQueryClient();

  const pageId = useMemo(() => {
    return `transactions-${eventId}`;
  }, [eventId]);

  const { get } = useTransactionsApi({
    eventId: eventId!,
    pageId,
    ...(filters?.[pageId] || {}),
    // @ts-expect-error fetch
    pageSize: pagination?.[pageId]?.pageSize || 10,
    ...(pagination?.[pageId] || {}),
  });

  const tableRef = useRef<DynamicTableRefType>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["transactions", eventId, pagination?.[pageId]],
    queryFn: get,
    placeholderData: keepPreviousData,
  });

  const staff = queryClient.getQueryData<StaffMember[]>(["staff", eventId]);
  const menu = queryClient.getQueryData<ItemConfig[]>(["menu", eventId]);

  const filterFields = useMemo(() => {
    return transactionFilters({
      menu: menu || [],
      staff: staff || [],
    });
  }, [menu, staff]);

  useEffect(() => {
    if (!updatePageProps) return;

    function invalidate() {
      if (pagination[pageId]) {
        setPagination(pageId, { page: 0 });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["transactions", eventId],
        });
      }, 50);
    }

    updatePageProps((prev) => ({
      ...prev,
      onSearch(search) {
        if (!tableRef.current) return;
        tableRef.current.tableApi.setGlobalFilter(search);
      },
      filterProps: {
        fields: filterFields,
        filterId: pageId,
        onFilter: invalidate,
        onClearFilter: invalidate,
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
    }));
  }, [
    refetch,
    updatePageProps,
    eventId,
    queryClient,
    filterFields,
    pageId,
    pagination,
    setPagination,
  ]);

  return (
    <DynamicTable
      ref={tableRef}
      serverSidePagination
      tableData={data || []}
      isLoading={isFetching}
      paginationKey={pageId}
      headerColumns={transactionHeaders as ColumnDef<unknown>[]}
    />
  );
}

export default TransactionsView;
