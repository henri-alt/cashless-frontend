import {
  useEffect,
  useRef,
  useContext,
  useMemo,
  Fragment,
  useState,
} from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useClientsApi } from "@/services/api";
import {
  DynamicTable,
  DynamicTableRefType,
} from "@/components/dynamic-table/dynamic-table";
import { clientHeaders } from "@/data/views-data/headers/clientHeaders";
import { ColumnDef } from "@tanstack/react-table";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { ClientType } from "@/types";
import { WarningModal } from "@/components/cards";
import { ClientForm } from "@/components/forms";
import useStore from "@/store";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";

function ClientsView() {
  const { updatePageProps } = useContext(AuthContext);

  const { pagination } = useStore();
  const pageId = useMemo(() => {
    return "clients";
  }, []);

  const { get, remove } = useClientsApi({
    pageId,
    getParams: {
      // @ts-expect-error fetch
      pageSize: pagination?.[pageId]?.pageSize || 10,
      ...(pagination?.[pageId] || {}),
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<ClientType>();
  const [editClient, setEditClient] = useState<ClientType>();

  const tableRef = useRef<DynamicTableRefType>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["clients", pagination?.[pageId]],
    queryFn: get,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps((prev) => ({
      ...prev,
      hasSearch: true,
      hasExports: false,
      hasNew: false,
      title: "Clients",
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
    }));
  }, [updatePageProps, refetch]);

  const headerColumns = useMemo(() => {
    return clientHeaders({
      onDelete(client) {
        setDeleteWarning(client);
      },
      onEdit(client) {
        setEditClient(client);
        setModalOpen(true);
      },
    });
  }, []);

  return (
    <Fragment>
      <DynamicTable
        ref={tableRef}
        isLoading={isFetching}
        tableData={data || []}
        serverSidePagination
        paginationKey={pageId}
        headerColumns={headerColumns as ColumnDef<unknown>[]}
      />
      {modalOpen ? (
        <ClientForm
          open={modalOpen}
          client={editClient!}
          onCancel={() => {
            setModalOpen(false);
            if (editClient) {
              setEditClient(undefined);
            }
          }}
        />
      ) : null}
      <WarningModal
        open={!!deleteWarning}
        onClose={() => {
          setDeleteWarning(undefined);
        }}
        onConfirm={() => {
          if (!deleteWarning) return;
          remove
            .mutateAsync({
              balanceId: deleteWarning.balanceId,
              clientId: deleteWarning.clientId,
            })
            .finally(() => {
              setDeleteWarning(undefined);
            });
        }}
        headerTitle="Delete warning"
        warningTitle={`Are you sure you want to delete this client ${deleteWarning?.clientName}?`}
        warningContent="This operation will delete this client's balance along with any top up and transaction this client made in any event"
      />
    </Fragment>
  );
}

export default ClientsView;
