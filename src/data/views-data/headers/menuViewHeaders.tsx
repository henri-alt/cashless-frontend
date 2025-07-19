import { ItemConfig } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/view-components/menu-row-options";

interface MenuHeaderParam {
  onEdit: (item: ItemConfig) => void;
  onRemove: (item: ItemConfig) => void;
}

export function menuViewHeaders(
  param: MenuHeaderParam
): ColumnDef<ItemConfig>[] {
  return [
    {
      accessorKey: "itemName",
      header: "Item Name",
      enableHiding: false,
    },
    {
      accessorKey: "itemCategory",
      header: "Category",
    },
    {
      accessorKey: "itemPrice",
      header: "Price",
    },
    {
      accessorKey: "staffPrice",
      header: "Staff Price",
    },
    {
      accessorKey: "itemTax",
      header: "Tax",
    },
    {
      header: "Actions",
      cell({ row }) {
        return (
          <DataTableRowActions
            row={row}
            onEdit={(item) => {
              if (param.onEdit) {
                param.onEdit(item);
              }
            }}
            onRemove={(item) => {
              if (param.onRemove) {
                param.onRemove(item);
              }
            }}
          />
        );
      },
    },
  ];
}
