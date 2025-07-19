import { FieldOptions } from "@/components/view-components/view-filter/view-filter";
import { CurrencyType, StaffMember } from "@/types";

interface TopUpsFiltersParam {
  staff: StaffMember[];
  currencies: CurrencyType[];
}

export function topUpsFilters(param: TopUpsFiltersParam): FieldOptions[] {
  return [
    {
      fieldType: "select",
      label: "Staff",
      name: "memberId",
      options: param.staff.flatMap((e) => {
        if (e.userClass === 2) {
          return {
            label: e.memberName,
            value: e.memberId,
          };
        }

        return [];
      }),
    },
    {
      label: "Scan Id",
      name: "scanId",
      fieldType: "input",
    },
    {
      fieldType: "select",
      label: "Currency",
      name: "topUpCurrency",
      options: param.currencies.map((e) => ({
        label: e.currency,
        value: e.currency,
      })),
    },
  ];
}
