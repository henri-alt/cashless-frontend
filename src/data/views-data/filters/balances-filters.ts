import { StaffMember } from "@/types";
import { FieldOptions } from "@/components/view-components/view-filter/view-filter";

interface BalanceFilterParam {
  eventStaff: StaffMember[];
}

export function balancesFilters(param: BalanceFilterParam): FieldOptions[] {
  return [
    {
      fieldType: "input",
      label: "Ticket Id",
      name: "ticketId",
      placeholder: "Ticket id...",
    },
    {
      fieldType: "input",
      label: "Scan Id",
      name: "scanId",
      placeholder: "Scan id...",
    },
    {
      fieldType: "select",
      label: "Created by",
      name: "createdBy",
      options: param.eventStaff?.flatMap((e) => {
        if (e.userClass === 2)
          return {
            label: e.memberName,
            value: e.memberName,
          };

        return [];
      }),
    },
    {
      fieldType: "select",
      label: "Fidelity Card",
      name: "isFidelityCard",
      options: [
        { label: "True", value: "true" },
        { label: "False", value: "false" },
      ],
    },
  ];
}
