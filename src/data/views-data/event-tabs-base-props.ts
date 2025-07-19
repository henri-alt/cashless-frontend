import { type AuthPageProps } from "@/layouts/authenticated-layout/authenticated-layout";

type TabsProps = Record<string, Partial<AuthPageProps> & { title: string }>;

export const eventTabsBaseProps: TabsProps = {
  overview: {
    hasSearch: false,
    hasExports: true,
    hasNew: true,
    hasFilter: false,
    exportsPosition: "right",
    title: "Overview",
    customButtonText: "Edit Event",
  },
  staff: {
    hasSearch: true,
    hasExports: false,
    hasNew: true,
    hasFilter: false,
    searchPosition: "right",
    title: "Staff",
    customButtonText: "Add Staff",
    customHeaderActions: null,
  },
  menu: {
    hasSearch: true,
    hasNew: true,
    hasExports: false,
    hasFilter: false,
    searchPosition: "right",
    title: "Menu",
    customButtonText: "Add Menu",
  },
  stands: {
    hasSearch: true,
    hasNew: true,
    hasExports: false,
    hasFilter: false,
    searchPosition: "right",
    title: "Stands",
    customButtonText: "Add Stand",
    customHeaderActions: null,
  },
  balances: {
    hasSearch: true,
    hasExports: false,
    hasFilter: true,
    searchPosition: "right",
    title: "Balances",
    hasNew: false,
  },
  ["top-ups"]: {
    hasSearch: true,
    hasExports: false,
    hasNew: false,
    hasFilter: true,
    searchPosition: "right",
    title: "Top Ups",
  },
  transactions: {
    hasSearch: true,
    hasExports: false,
    hasNew: false,
    hasFilter: true,
    searchPosition: "right",
    title: "Transactions",
  },
};
