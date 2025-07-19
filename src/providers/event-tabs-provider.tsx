import { useContext, useEffect, useRef } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { TabNavigationComponent } from "@/components/forms/event-form/event-form-tabs";
import {
  Outlet,
  useNavigate,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  useEventsApi,
  useStaffApi,
  useMenuItemsApi,
  useStandsApi,
  useCurrenciesApi,
  useAnalyticsApi,
} from "@/services/api";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { EventType } from "@/types";
import { EventCustomTitle } from "@/components/view-components/event-custom-title";
import { eventViewTabs } from "@/data/views-data/event-view-tabs";
import { eventTabsBaseProps } from "@/data/views-data/event-tabs-base-props";

export function EventTabsProvider() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const { updatePageProps } = useContext(AuthContext);
  const updatedOnce = useRef(false);

  let selectedTab = "overview";
  const eventId = params?.eventId || "";
  const lastPathComp = location.pathname.split("/").at(-1);

  if (lastPathComp !== eventId && lastPathComp) {
    selectedTab = lastPathComp || "overview";
  }

  const { get: getEvent } = useEventsApi({ eventId });
  const { get: getStaff } = useStaffApi({ eventId });
  const { get: getMenu } = useMenuItemsApi({ eventId });
  const { get: getStands } = useStandsApi({ eventId });
  const { get: getCurrencies } = useCurrenciesApi({ eventId });
  const { data: event } = useQuery({
    queryKey: ["events", eventId],
    queryFn: getEvent,
  });

  const { get: getAnalytics } = useAnalyticsApi({
    event: event as EventType,
  });

  useQueries({
    queries: [
      {
        queryKey: ["staff", eventId],
        queryFn: getStaff,
      },
      {
        queryKey: ["menu", eventId],
        queryFn: getMenu,
      },
      {
        queryKey: ["stands", eventId],
        queryFn: getStands,
      },
      {
        queryKey: ["currencies", eventId],
        queryFn: getCurrencies,
      },
      {
        queryKey: ["analytics", eventId],
        queryFn: getAnalytics,
        enabled: !!event,
      },
    ],
  });

  useEffect(() => {
    if (!updatePageProps || !event) return;

    updatedOnce.current = true;

    updatePageProps(
      updatedOnce.current
        ? (prev) => ({
            ...prev,
            customTitle: <EventCustomTitle />,
            ...eventTabsBaseProps[selectedTab],
          })
        : {
            customTitle: <EventCustomTitle />,
            ...eventTabsBaseProps[selectedTab],
          }
    );
  }, [updatePageProps, event, selectedTab]);

  if (!lastPathComp || lastPathComp === eventId) {
    return <Navigate to={`/events/${eventId}/overview`} />;
  }

  return (
    <section className="grid grid-rows-[39px,_calc(100%-49px)] gap-[10px]">
      <TabNavigationComponent
        value={selectedTab}
        className="rounded-none"
        tabListClass="flex flex-row justify-start gap-[10px] rounded-none px-1 py-0"
        tabList={eventViewTabs.map((e) => ({
          ...e,
          className: "h-full rounded-none",
          onClick() {
            if (eventId) {
              navigate(`/events/${eventId}/${e.value}`);
            }
          },
        }))}
      />
      <Outlet />
    </section>
  );
}
