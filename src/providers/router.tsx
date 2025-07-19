import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthenticatedLayout } from "@layouts";
import {
  LoginView,
  BalancesView,
  ClientsView,
  EventInfoView,
  EventsView,
  MenuView,
  StaffView,
  StandsView,
  TopUpsView,
  TransactionsView,
  NotFound,
  ReportsView,
} from "@views";
import { AuthProvider } from "@/providers/auth-provider";
import { EventTabsProvider } from "@/providers/event-tabs-provider";

const router = createBrowserRouter([
  {
    Component: AuthProvider,
    children: [
      {
        path: "/login",
        Component: LoginView,
      },
      {
        Component: AuthenticatedLayout,
        children: [
          {
            path: "/events",
            Component: EventsView,
          },
          {
            path: "/events/:eventId",
            Component: EventTabsProvider,
            children: [
              {
                path: "/events/:eventId/overview",
                Component: EventInfoView,
              },
              {
                path: "/events/:eventId/staff",
                Component: StaffView,
              },
              {
                path: "/events/:eventId/menu",
                Component: MenuView,
              },
              {
                path: "/events/:eventId/stands",
                Component: StandsView,
              },
              {
                path: "/events/:eventId/balances",
                Component: BalancesView,
              },
              {
                path: "/events/:eventId/top-ups",
                Component: TopUpsView,
              },
              {
                path: "/events/:eventId/transactions",
                Component: TransactionsView,
              },
            ],
          },
          {
            path: "/clients",
            Component: ClientsView,
          },
          {
            path: "/reports",
            Component: ReportsView,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/events" />,
  },
  {
    path: "/*",
    Component: NotFound,
  },
]);

export default router;
