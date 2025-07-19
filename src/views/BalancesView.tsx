import {
  Fragment,
  useState,
  useEffect,
  useRef,
  useContext,
  useMemo,
} from "react";
import { useBalancesApi } from "@/services/api";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  DynamicTable,
  DynamicTableRefType,
} from "@/components/dynamic-table/dynamic-table";
import { balancesViewHeaders } from "@/data/views-data/headers/balancesViewHeaders";
import { ColumnDef } from "@tanstack/react-table";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { BalanceType, StaffMember } from "@/types";
import { WarningModal } from "@/components/cards";
import { type FieldOptions } from "../components/view-components/view-filter/view-filter";
import useStore from "@/store";
import { balancesFilters } from "@/data/views-data/filters/balances-filters";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";

function BalancesView() {
  const { eventId } = useParams();
  const { updatePageProps } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { filters, pagination, setPagination } = useStore();

  const [deleteWarning, setDeleteWarning] = useState<BalanceType>();
  const [deleteAllWarning, setDeleteAllWarning] = useState(false);

  const pageId = useMemo(() => {
    return `balances-${eventId}`;
  }, [eventId]);

  const tableRef = useRef<DynamicTableRefType>(null);

  const { remove, get, removeEventBalances } = useBalancesApi({
    eventId: eventId!,
    pageId,
    ...(filters?.[pageId] || {}),
    // @ts-expect-error fetch
    pageSize: pagination?.[pageId]?.pageSize || 10,
    ...(pagination?.[pageId] || {}),
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["balances", eventId, pagination?.[pageId]],
    queryFn: get,
    placeholderData: keepPreviousData,
  });

  const eventStaff = queryClient.getQueryData<StaffMember[]>([
    "staff",
    eventId,
  ]);

  const filterFields = useMemo<FieldOptions[]>(() => {
    return balancesFilters({ eventStaff: eventStaff || [] });
  }, [eventStaff]);

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
          queryKey: ["balances", eventId],
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
        <Fragment>
          <Button
            onClick={() => {
              refetch();
            }}
            className="[&>path]:fill-current [&>svg]:fill-current"
          >
            <RefreshIcon />
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setDeleteAllWarning(true);
            }}
          >
            Delete All
          </Button>
        </Fragment>
      ),
    }));
  }, [
    refetch,
    pageId,
    eventId,
    filterFields,
    queryClient,
    updatePageProps,
    pagination,
    setPagination,
  ]);

  const headerColumns = useMemo(() => {
    return balancesViewHeaders({
      onDelete(balance) {
        setDeleteWarning(balance);
      },
    });
  }, []);

  return (
    <Fragment>
      <DynamicTable
        ref={tableRef}
        tableData={data || []}
        isLoading={isFetching}
        serverSidePagination
        paginationKey={pageId}
        headerColumns={headerColumns as ColumnDef<unknown>[]}
      />
      <WarningModal
        onClose={() => {
          setDeleteWarning(undefined);
        }}
        onConfirm={async () => {
          if (!deleteWarning) return;

          remove
            .mutateAsync({
              balanceId: deleteWarning.balanceId,
              isFidelityCard: deleteWarning.isFidelityCard,
              scanId: deleteWarning.scanId,
            })
            .finally(() => {
              setDeleteWarning(undefined);
            });
        }}
        open={!!deleteWarning}
        headerTitle="Delete warning"
        warningTitle={`Are you sure you want to delete this balance (${deleteWarning?.scanId})?`}
        warningContent="This operation will delete the balance's top ups as well"
      />
      <WarningModal
        onClose={() => {
          setDeleteAllWarning(false);
        }}
        onConfirm={async () => {
          await removeEventBalances.mutateAsync(eventId!).finally(() => {
            setDeleteAllWarning(false);
          });
        }}
        open={deleteAllWarning}
        headerTitle="Delete warning"
        warningTitle="Are you sure you want all of the event balances?"
        warningContent="This operation will delete all the balances and top ups which are not related to any client"
      />
    </Fragment>
  );
}

export default BalancesView;
