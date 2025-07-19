import { StaffMember, StandConfigType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableRowActions } from "@/components/view-components/menu-row-options";

interface StandColumnsParam {
  onEdit: (stand: StandConfigType) => void;
  onDelete: (stand: StandConfigType) => void;
  onShowStaff: (stand: StandConfigType) => void;
  onShowMenu: (stand: StandConfigType) => void;
  staff: StaffMember[];
}

export function standsColumns(
  param: StandColumnsParam
): ColumnDef<StandConfigType>[] {
  return [
    { header: "Stand Name", accessorKey: "standName" },
    {
      header: "Stand Type",
      cell({ row }) {
        if (row.original.menuItems.length) {
          return "Bartender";
        }

        const firstMemberId: string = row.original.staffMembers.at(0)!;
        const oneMember = param.staff.find((e) => e.memberId === firstMemberId);

        if (!oneMember) return "";

        if (oneMember.userClass === 3) return "Door";

        return "Cashier";
      },
    },
    {
      header: "Staff",
      accessorKey: "staffMembers",
      cell({ row }) {
        return (
          <Button
            onClick={() => {
              param.onShowStaff(row.original);
            }}
            disabled={!row.original.staffMembers.length}
          >
            View Staff
          </Button>
        );
      },
    },
    {
      header: "Menu",
      accessorKey: "staffMembers",
      cell({ row }) {
        return (
          <Button
            onClick={() => {
              param.onShowMenu(row.original);
            }}
            disabled={!row.original.menuItems.length}
          >
            View Menu
          </Button>
        );
      },
    },
    {
      header: "Actions",
      cell({ row }) {
        return (
          <DataTableRowActions
            row={row}
            onEdit={param.onEdit}
            onRemove={param.onDelete}
          />
        );
      },
    },
  ];
}
