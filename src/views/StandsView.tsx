import {
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  Fragment,
  useCallback,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useStandsApi } from "@/services/api";
import {
  DynamicTable,
  DynamicTableRefType,
} from "@/components/dynamic-table/dynamic-table";
import { standsColumns } from "@/data/views-data/headers/standsColumns";
import { ColumnDef } from "@tanstack/react-table";
import { WarningModal } from "@/components/cards";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import {
  CurrencyType,
  ItemConfig,
  StaffMember,
  StandConfigType,
} from "@/types";
import { StandForm } from "@/components/forms";
import {
  ListModalProps,
  ListModal,
} from "@/components/view-components/list-modal";

function StandsView() {
  const { eventId } = useParams();
  const { updatePageProps } = useContext(AuthContext);

  const { get, remove } = useStandsApi({
    eventId: eventId!,
  });
  const [listModal, setListModal] = useState<ListModalProps>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editStand, setEditStand] = useState<StandConfigType>();
  const [deleteWarning, setDeleteWarning] = useState<StandConfigType>();
  const tableRef = useRef<DynamicTableRefType>(null);

  const { data } = useQuery({
    queryFn: get,
    queryKey: ["stands", eventId],
  });
  const { data: menu } = useQuery<ItemConfig[]>({
    queryKey: ["menu", eventId],
  });
  const { data: staff } = useQuery<StaffMember[]>({
    queryKey: ["staff", eventId],
  });
  const { data: currencies } = useQuery<CurrencyType[]>({
    queryKey: ["currencies", eventId],
  });

  const calcListItems = useCallback(
    (
      stand: StandConfigType,
      type: "staff" | "menu"
    ): ListModalProps["list"] => {
      switch (type) {
        case "staff": {
          const staffMap = (staff || []).reduce(
            (acc, val) => ({
              ...acc,
              [val.memberId]: val,
            }),
            {} as Record<string, StaffMember>
          );

          return stand.staffMembers.map((e) => ({
            title: staffMap[e]?.memberName,
            value: staffMap[e]?.memberEmail,
          }));
        }
        case "menu": {
          const defaultCurrency = (currencies || []).find(
            (e) => e.isDefault
          )?.currency;

          const menuMap = (menu || []).reduce(
            (acc, val) => ({
              ...acc,
              [val.itemName]: val,
            }),
            {} as Record<string, ItemConfig>
          );

          return stand.menuItems.flatMap((e) => {
            if (!(e in menuMap)) {
              return [];
            }

            return {
              title: e,
              value: `${menuMap[e]["itemPrice"]} ${defaultCurrency}`,
            };
          });
        }
        default:
          return [];
      }
    },
    [menu, staff, currencies]
  );

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps((prev) => ({
      ...prev,
      onNew() {
        setModalOpen(true);
      },
      onSearch(search) {
        if (!tableRef.current) return;

        tableRef.current.tableApi.setGlobalFilter(search);
      },
    }));
  }, [updatePageProps]);

  const headerColumns = useMemo(() => {
    return standsColumns({
      staff: staff || [],
      onDelete(stand) {
        setDeleteWarning(stand);
      },
      onEdit(stand) {
        setEditStand(stand);
        setModalOpen(true);
      },
      onShowMenu(stand) {
        setListModal({
          list: calcListItems(stand, "menu"),
          onCancel() {
            setListModal(undefined);
          },
          open: true,
          title: "Menu",
        });
      },
      onShowStaff(stand) {
        setListModal({
          list: calcListItems(stand, "staff"),
          onCancel() {
            setListModal(undefined);
          },
          open: true,
          title: "Staff",
        });
      },
    });
  }, [calcListItems, staff]);

  return (
    <Fragment>
      <DynamicTable
        tableData={data || []}
        headerColumns={headerColumns as ColumnDef<unknown>[]}
        ref={tableRef}
      />
      {modalOpen ? (
        <StandForm
          open
          onCancel={() => {
            setModalOpen(false);
            if (editStand) {
              setEditStand(undefined);
            }
          }}
          stand={editStand}
        />
      ) : null}
      {listModal ? <ListModal {...listModal} /> : null}
      <WarningModal
        onClose={() => {
          setDeleteWarning(undefined);
        }}
        onConfirm={() => {
          if (!deleteWarning) return;

          remove
            .mutateAsync({
              standName: deleteWarning.standName!,
            })
            .finally(() => {
              setDeleteWarning(undefined);
            });
        }}
        open={!!deleteWarning}
        headerTitle="Delete warning"
        warningTitle={`Are you sure you want to delete this stand (${deleteWarning?.standName})?`}
      />
    </Fragment>
  );
}

export default StandsView;
