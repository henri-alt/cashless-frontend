import {
  Fragment,
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useStaffApi } from "@/services/api";
import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { staffViewHeaders } from "@/data/views-data/headers/staffViewHeaders";
import { ColumnDef } from "@tanstack/react-table";
import { StaffForm } from "@/components/forms";
import { StaffMember } from "@/types";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { type DynamicTableRefType } from "../components/dynamic-table/dynamic-table";
import { WarningModal } from "@/components/cards";

function StaffView() {
  const { eventId } = useParams();
  const { get, remove } = useStaffApi({
    eventId: eventId!,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember>();
  const [deleteMember, setDeleteMember] = useState<StaffMember>();

  const { updatePageProps } = useContext(AuthContext);

  const tableRef = useRef<DynamicTableRefType>(null);

  const { data, isFetching } = useQuery({
    queryFn: get,
    queryKey: ["staff", eventId],
  });

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps((prev) => ({
      ...prev,
      onNew() {
        setModalOpen(true);
      },
      onSearch(search) {
        if (!tableRef.current) {
          return;
        }

        tableRef.current.tableApi.setGlobalFilter(search);
      },
    }));
  }, [updatePageProps]);

  const headerColumns = useMemo(() => {
    return staffViewHeaders({
      onEdit(member) {
        setEditStaff(member);
        setModalOpen(true);
      },
      onRemove(member) {
        setDeleteMember(member);
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
        <StaffForm
          open
          onCancel={() => {
            setModalOpen(false);
            if (editStaff) {
              setEditStaff(undefined);
            }
          }}
          member={editStaff}
        />
      ) : null}
      <WarningModal
        open={!!deleteMember}
        onClose={() => {
          setDeleteMember(undefined);
        }}
        onConfirm={async () => {
          await remove
            .mutateAsync({
              memberId: deleteMember?.memberId,
            })
            .finally(() => {
              setDeleteMember(undefined);
            });
        }}
        headerTitle="Delete warning"
        warningTitle={`Are you sure you want to remove ${deleteMember?.memberName}?`}
      />
    </Fragment>
  );
}

export default StaffView;
