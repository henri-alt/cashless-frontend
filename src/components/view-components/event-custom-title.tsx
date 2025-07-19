import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CurrencyType,
  EventType,
  GetEventExportAnalyticsResponse,
} from "@/types";
import { LeftArrow, TickIcon, TransactionsIcon } from "@/assets";
import { Button } from "@/components/ui/button";
import dayjs from "@dayjs";
import { useQueryClient, useQuery } from "@tanstack/react-query";

export function EventCustomTitle() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const interval = useRef<NodeJS.Timeout>();
  const [lastUpdate, setLastUpdate] = useState<string>("now");

  const queryClient = useQueryClient();

  const mountTime = useRef(Date.now());

  const event = queryClient.getQueryData<EventType>(["events", eventId]);
  const { data: analytics, dataUpdatedAt } =
    useQuery<GetEventExportAnalyticsResponse>({
      queryKey: ["analytics", eventId],
    });
  const currencies = queryClient.getQueryData<CurrencyType[]>([
    "currencies",
    eventId,
  ]);

  useEffect(() => {
    function updateDuration() {
      setLastUpdate(
        dayjs
          .duration(
            (dataUpdatedAt || mountTime.current) - Date.now(),
            "milliseconds"
          )
          .humanize(true)
      );
    }

    if (interval.current) {
      clearTimeout(interval.current);
      updateDuration();
    }

    interval.current = setInterval(() => {
      updateDuration();
    }, 60_000);

    return () => {
      clearInterval(interval.current);
    };
  }, [dataUpdatedAt]);

  const defaultCurrency = currencies?.find((e) => e.isDefault);

  return (
    <div className="flex flex-row flex-nowrap gap-5 justify-start items-center">
      <Button
        onClick={() => {
          navigate("/events");
        }}
        className={"bg-transparent hover:bg-transparent px-0"}
      >
        <LeftArrow className="[&>path]:fill-primary" />
      </Button>
      <div className="flex flex-col justify-between items-start">
        <section className="flex flex-row flex-nowrap gap-5 justify-start items-center">
          <span className="font-semibold text-xl md:text-2xl">
            {event?.eventName}
          </span>
          {analytics ? (
            <div className="hidden lg:flex flex-row flex-nowrap">
              <TransactionsIcon className="[&>path]:fill-[#75D840]" />
              <span>
                {Number(
                  analytics?.eventOverview?.totalCash || 0
                ).toLocaleString()}{" "}
                {defaultCurrency?.currency}
              </span>
            </div>
          ) : null}
        </section>
        <section className="hidden md:flex text-muted-foreground flex-row flex-nowrap justify-start items-center [&>svg]:fill-current [&>path]:fill-current h-5">
          <span>Last updated: {lastUpdate}</span>
          <TickIcon
            height={16}
            width={16}
            className="grid place-items-center"
          />
        </section>
      </div>
    </div>
  );
}
