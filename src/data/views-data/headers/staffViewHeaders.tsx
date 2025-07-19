import { StaffMember } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/view-components/menu-row-options";

const role: { [index: string | number]: string } = {
  "0": "Admin",
  "2": "Cashier",
  "1": "Bartender",
  "3": "Door",
};

interface StaffHeaderParams {
  onEdit: (member: StaffMember) => void;
  onRemove: (member: StaffMember) => void;
}

export function staffViewHeaders(
  param: StaffHeaderParams
): ColumnDef<StaffMember>[] {
  return [
    { header: "Name", accessorKey: "memberName" },
    { header: "Username", accessorKey: "memberEmail" },
    {
      header: "Position",
      accessorKey: "userClass",
      accessorFn(row) {
        return role[row.userClass];
      },
    },
    { header: "Status", accessorKey: "profileStatus" },
    {
      header: "Action",
      cell({ row }) {
        return (
          <DataTableRowActions
            row={row}
            onEdit={(member) => {
              if (param.onEdit) {
                param.onEdit(member);
              }
            }}
            onRemove={(member) => {
              if (param.onRemove) {
                param.onRemove(member);
              }
            }}
          />
        );
      },
    },
  ];
}
