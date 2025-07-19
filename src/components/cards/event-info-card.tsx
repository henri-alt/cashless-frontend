import { useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  EventType,
  GetEventExportAnalyticsResponse,
  CurrencyType,
} from "@/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEventsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { WarningModal } from "@/components/cards/warning-modal";
import { EventInfoCardItem } from "@/components/cards/info-card-item";

interface EventInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event?: EventType;
  analytics?: GetEventExportAnalyticsResponse;
  currencies?: CurrencyType[];
}

export function EventInfoCard(props: EventInfoCardProps) {
  const [warning, setWarning] = useState(false);
  const navigate = useNavigate();

  const { event, analytics, currencies = [], className, ...rest } = props;

  const { changeEventStatus, remove } = useEventsApi({
    eventId: event?.eventId,
  });

  const defaultCurrency = useMemo(() => {
    return currencies.find((e) => e.isDefault)?.currency || "";
  }, [currencies]);

  const eventActive = event?.eventStatus === "active";

  return (
    <Fragment>
      <Card
        {...rest}
        className={cn(
          "rounded-[10px] border bg-card text-card-foreground shadow-sm",
          className
        )}
      >
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%_-_64px_-_72px)] overflow-y-auto">
          <ul
            role="list"
            className="divide-y divide-gray-200 dark:divide-gray-700 h-fit"
          >
            <EventInfoCardItem
              title="Activation Minimum"
              value={`${event?.activationMinimum} ${defaultCurrency}`}
            />
            <EventInfoCardItem
              title="Card Price"
              value={`${event?.cardPrice} ${defaultCurrency}`}
            />
            <EventInfoCardItem
              title="Tag Price"
              value={`${event?.tagPrice} ${defaultCurrency}`}
            />
            <EventInfoCardItem
              title="Ticket Price"
              value={`${event?.ticketPrice} ${defaultCurrency}`}
            />
            <EventInfoCardItem
              title="Total Revenue"
              value={`${(
                analytics?.eventOverview?.totalCash || 0
              ).toLocaleString()} ${defaultCurrency}`}
            />
            <EventInfoCardItem
              title="New Clients"
              value={analytics?.eventOverview?.newClients || 0}
            />
            <EventInfoCardItem
              title="Most Active Bartender"
              value={analytics?.eventOverview?.mostActiveBartender}
            />
            <EventInfoCardItem
              title="Most Active Cashier"
              value={analytics?.eventOverview?.mostActiveCashier}
            />
            <EventInfoCardItem
              title="Most Sold Item"
              value={analytics?.eventOverview?.mostSoldItem}
            />
            <EventInfoCardItem
              title="Left In Balances"
              value={`${
                analytics?.eventOverview?.leftInBalances || 0
              } ${defaultCurrency}`}
            />
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end flex-row flex-nowrap w-full items-center gap-[10px]">
          <Button
            onClick={() => {
              changeEventStatus.mutate({
                eventStatus: eventActive ? "inactive" : "active",
              });
            }}
          >
            {eventActive ? "End" : "Start"} Event
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => {
              setWarning(true);
            }}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
      {warning ? (
        <WarningModal
          open
          onClose={() => {
            setWarning(false);
          }}
          headerTitle="Delete warning"
          warningTitle="Are you sure you want to delete this event?"
          warningContent="This action deletes all the data for this event including
          Transactions, Staff Members, Balances"
          onConfirm={async () => {
            await remove
              .mutateAsync({ eventId: event?.eventId })
              .then(() => {
                setWarning(false);
                navigate("/events");
              })
              .catch((err) => {
                console.error("Error deleting: ", err);
              });
          }}
        />
      ) : null}
    </Fragment>
  );
}
