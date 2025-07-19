import {
  useContext,
  useEffect,
  useState,
  Fragment,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useMenuItemsApi } from "@/services/api";
import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { ColumnDef } from "@tanstack/react-table";
import { menuViewHeaders } from "@/data/views-data/headers/menuViewHeaders";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { MenuItemForm } from "@/components/forms";
import { ItemConfig } from "@/types";
import { type DynamicTableRefType } from "@/components/dynamic-table/dynamic-table";
import { excelParser } from "@/utils";
import { Button } from "@/components/ui/button";
import { WarningModal } from "@/components/cards";
import { useToast } from "@/hooks/use-toast";

function MenuView() {
  const { eventId } = useParams();
  const { get, create, remove } = useMenuItemsApi({
    eventId: eventId!,
  });

  const { updatePageProps } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemConfig>();
  const [deleteWarning, setDeleteWarning] = useState<string>("");

  const { toast } = useToast();

  const tableRef = useRef<DynamicTableRefType>(null);
  const uploadElement = useRef<HTMLInputElement>(
    document.createElement("input")
  );

  const { data, isFetching } = useQuery({
    queryFn: get,
    queryKey: ["menu", eventId],
  });

  const onSearch = useCallback((str: string) => {
    if (!tableRef.current) {
      return;
    }

    tableRef.current.tableApi.setGlobalFilter(str);
  }, []);

  const onFileUpload = useCallback(
    async (e: Event) => {
      const element = e.target as HTMLInputElement;
      if (!element?.files?.[0]) return;

      await excelParser(element?.files?.[0])
        .then((uploadedItems) => {
          create.mutate(uploadedItems);
        })
        .catch((err) => {
          console.error("Error uploading document: ", err);
          toast({
            title: "Error uploading",
            description: "Excel format was not recognized",
            variant: "destructive",
          });
        });
    },
    [create, toast]
  );

  useEffect(() => {
    uploadElement.current.setAttribute("type", "file");
    uploadElement.current.setAttribute(
      "accept",
      ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    );

    uploadElement.current.onchange = onFileUpload;
  }, [onFileUpload]);

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps((prev) => ({
      ...prev,
      onNew() {
        setModalOpen(true);
      },
      customHeaderActions: (
        <Button
          onClick={() => {
            uploadElement.current.click();
          }}
        >
          Upload Menu
        </Button>
      ),
      onSearch,
    }));
  }, [updatePageProps, onSearch]);

  const headerColumns: ColumnDef<ItemConfig>[] = useMemo(() => {
    return menuViewHeaders({
      onEdit(item) {
        setEditItem(item);
        setModalOpen(true);
      },
      onRemove(item) {
        setDeleteWarning(item.itemName);
      },
    });
  }, []);

  return (
    <Fragment>
      <DynamicTable
        tableData={data || []}
        headerColumns={headerColumns as ColumnDef<unknown>[]}
        isLoading={isFetching}
        ref={tableRef}
      />
      {modalOpen ? (
        <MenuItemForm
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            if (editItem) {
              setEditItem(undefined);
            }
          }}
          item={editItem}
        />
      ) : null}
      <WarningModal
        open={!!deleteWarning}
        onClose={() => {
          setDeleteWarning("");
        }}
        onConfirm={async () => {
          remove
            .mutateAsync({
              itemName: deleteWarning,
            })
            .finally(() => {
              setDeleteWarning("");
            });
        }}
        headerTitle="Delete warning"
        warningTitle={`Are you sure you want to delete this item (${deleteWarning})?`}
      />
    </Fragment>
  );
}

export default MenuView;
