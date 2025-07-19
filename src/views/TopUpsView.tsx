import { useEffect, useRef, useContext, useMemo } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useTopUpsApi } from "@/services/api";
import {
  DynamicTable,
  DynamicTableRefType,
} from "@/components/dynamic-table/dynamic-table";
import { ColumnDef } from "@tanstack/react-table";
import { topUpHeaders } from "@/data/views-data/headers/topUpHeaders";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import useStore from "@/store";
import { StaffMember, CurrencyType } from "@/types";
import { topUpsFilters } from "@/data/views-data/filters/top-ups-filters";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";

function TopUpsView() {
  const { eventId } = useParams();
  const { updatePageProps } = useContext(AuthContext);
  const { filters, pagination, setPagination } = useStore();

  const queryClient = useQueryClient();

  const pageId = useMemo(() => {
    return `topUps-${eventId}`;
  }, [eventId]);

  const { get } = useTopUpsApi({
    eventId: eventId!,
    pageId,
    ...(filters?.[pageId] || {}),
    // @ts-expect-error fetch
    pageSize: pagination?.[pageId]?.pageSize || 10,
    ...(pagination?.[pageId] || {}),
  });

  const tableRef = useRef<DynamicTableRefType>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["topUps", eventId, pagination?.[pageId]],
    queryFn: get,
    placeholderData: keepPreviousData,
  });

  const currencies = queryClient.getQueryData<CurrencyType[]>([
    "currencies",
    eventId,
  ]);
  const staff = queryClient.getQueryData<StaffMember[]>(["staff", eventId]);

  const filterFields = useMemo(() => {
    return topUpsFilters({
      currencies: currencies || [],
      staff: staff || [],
    });
  }, [currencies, staff]);

  useEffect(() => {
    if (!updatePageProps) return;

    function invalidate() {
      if (pagination[pageId]) {
        setPagination(pageId, {
          page: 0,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["topUps", eventId],
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
      tableData={data || []}
      isLoading={isFetching}
      serverSidePagination
      paginationKey={pageId}
      headerColumns={topUpHeaders as ColumnDef<unknown>[]}
    />
  );
}

export default TopUpsView;
