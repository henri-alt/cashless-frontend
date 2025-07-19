import { Fragment, useState, useEffect, useContext, useCallback } from "react";
import {
  useCurrenciesApi,
  useEventsApi,
  useAnalyticsApi,
} from "@/services/api";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { EventType } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/assets";
import { EventForm } from "@/components/forms";
import { useToast } from "@/hooks/use-toast";
import {
  ItemsChart,
  TopUpsChart,
  BartendersChart,
  SmallOverallsChart,
} from "@/components/graphics";
import { EventInfoCard } from "@/components/cards";

function EventInfoView() {
  const { eventId } = useParams();
  const { updatePageProps } = useContext(AuthContext);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const { get } = useEventsApi({
    eventId: eventId!,
  });
  const { data: event } = useQuery({
    queryFn: get,
    queryKey: ["events", eventId],
  });

  const { get: getCurrencies } = useCurrenciesApi({ eventId: eventId! });
  const { get: getAnalytics, excelExport } = useAnalyticsApi({
    event: event as EventType,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies", eventId],
    queryFn: getCurrencies,
  });
  const {
    data: analytics,
    refetch: refreshAnalytics,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["analytics", eventId],
    queryFn: getAnalytics,
  });

  const onExcelExport = useCallback(async () => {
    try {
      await excelExport();
    } catch (err) {
      console.error("Export error: ", err);
      toast({
        title: "Export error",
        description:
          "Something went wrong while trying to export, please try again later",
      });
    }
  }, [excelExport, toast]);

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps((prev) => ({
      ...prev,
      onNew() {
        setFormOpen(true);
      },
      lastUpdate: dataUpdatedAt,
      onExcelExport,
      customHeaderActions: (
        <Button
          onClick={() => {
            refreshAnalytics();
          }}
          className="[&>path]:fill-current [&>svg]:fill-current"
        >
          <RefreshIcon />
        </Button>
      ),
    }));
  }, [updatePageProps, refreshAnalytics, onExcelExport, dataUpdatedAt]);

  return (
    <Fragment>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-[10px] h-fit max-h-[calc(100%_-_43px)] min-h-[calc(100%_-_43px)] p-[10px] overflow-y-auto [row-height:calc(100%_/_8)]">
        <EventInfoCard
          event={event as EventType}
          analytics={analytics}
          currencies={currencies}
          className="row-span-8 col-span-1 md:col-span-2 lg:col-span-2"
        />
        <SmallOverallsChart
          chartData={analytics?.topUpAnalytics || []}
          title="No. of top ups"
          total={`${(analytics?.topUpAnalytics || []).reduce(
            (acc, val) => acc + val.numberOfTopUps,
            0
          )} top ups`}
          xAxis="topUp"
          yAxis="numberOfTopUps"
          yLabel="Top Ups"
          className="col-span-1 md:col-span-1 lg:col-span-4 h-40"
        />
        <SmallOverallsChart
          chartData={(analytics?.bartenderAnalytics || []).slice(0, 5)}
          title="Top Bartenders"
          total={`${(analytics?.bartenderAnalytics || []).reduce(
            (acc, val) => acc + val.itemsSold,
            0
          )} sold`}
          xAxis="memberName"
          yAxis="itemsSold"
          yLabel="Sold"
          className="col-span-1 md:col-span-1 lg:col-span-4 h-40"
        />
        <ItemsChart
          data={analytics?.itemsAnalytics || []}
          className="col-span-1 md:col-span-2 lg:col-span-8 row-span-7"
        />
        <TopUpsChart
          className="col-span-1 md:col-span-2 lg:col-span-5"
          data={analytics?.topUpAnalytics || []}
        />
        <BartendersChart
          className="col-span-1 md:col-span-2 lg:col-span-5"
          data={analytics?.bartenderAnalytics || []}
        />
      </div>
      {formOpen ? (
        <EventForm
          open={formOpen}
          onCancel={() => {
            setFormOpen(false);
          }}
          currencies={currencies}
          event={event as Exclude<typeof event, { length: number }>}
        />
      ) : null}
    </Fragment>
  );
}

export default EventInfoView;
