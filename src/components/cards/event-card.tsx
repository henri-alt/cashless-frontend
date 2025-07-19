import { useRef } from "react";
import { EventType } from "@/types";
import { cn } from "@/lib/utils";
import {
  StockEventImg1,
  StockEventImg2,
  StockEventImg3,
  StockEventImg4,
  StockEventImg5,
  StockEventImg6,
} from "@/assets";

interface EventCardProps {
  event: EventType;
  onClick: (event: EventType) => void;
}

const img_urls = [
  StockEventImg1,
  StockEventImg2,
  StockEventImg3,
  StockEventImg4,
  StockEventImg5,
  StockEventImg6,
];

export function EventCard(props: EventCardProps) {
  const { eventDescription, eventName, startDate, eventStatus } = props.event;
  const srcRef = useRef(img_urls[Math.floor(Math.random() * 5.9)]);
  const pastEvent = useRef(
    new Date(startDate).valueOf() < Date.now() && eventStatus !== "active"
  );

  return (
    <div
      onClick={() => {
        if (props.onClick) props.onClick(props.event);
      }}
      className={cn(
        "rounded-[10px] border bg-card text-card-foreground shadow-[0_0_4px_0] p-5 cursor-pointer",
        "flex flex-row flex-nowrap justify-between items-start",
        "h-44 w-full max-w-[calc(100%_-_10px)]",
        eventStatus === "active"
          ? "shadow-lime-500"
          : pastEvent
          ? "shadow-none"
          : "shadow-amber-400"
      )}
    >
      <section className="flex flex-col gap-[10px] justify-start items-start w-[calc(100%_-_133px)]">
        <div className="text-base font-semibold">
          {eventName} ({new Date(startDate).toLocaleDateString()})
        </div>
        <div className="text-sm font-semibold">
          {eventDescription || "No description"}
        </div>
      </section>
      <section className="flex justify-center items-center h-full w-[123px]">
        <img src={srcRef.current} className="h-[123px] w-full bg-red-50"></img>
      </section>
    </div>
  );
}
