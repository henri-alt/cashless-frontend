import { FieldOptions } from "@/components/view-components/view-filter/view-filter";
import { ItemConfig, StaffMember } from "@/types";

interface TransactionFilterParam {
  menu: ItemConfig[];
  staff: StaffMember[];
}

export function transactionFilters(
  param: TransactionFilterParam
): FieldOptions[] {
  const categories = new Set(param.menu.map((e) => e.itemCategory));

  return [
    {
      label: "Menu item",
      name: "itemName",
      fieldType: "select",
      options: param.menu.map((e) => ({
        label: e.itemName,
        value: e.itemName,
      })),
    },
    {
      label: "Item category",
      name: "itemCategory",
      fieldType: "select",
      options: Array.from(categories).map((e) => ({
        label: e,
        value: e,
      })),
    },
    {
      label: "Scan Id",
      name: "scanId",
      fieldType: "input",
    },
    {
      label: "Sold by",
      name: "memberId",
      fieldType: "select",
      options: param.staff?.flatMap((e) => {
        if (e.userClass === 1)
          return {
            label: e.memberName,
            value: e.memberId,
          };

        return [];
      }),
    },
  ];
}
