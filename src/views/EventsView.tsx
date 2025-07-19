import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEventsApi } from "@/services/api";
import { EventCard } from "@/components/cards";
import { useNavigate } from "react-router-dom";
import { EventForm } from "@/components/forms";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";
import { EventType } from "@/types";

function EventsView() {
  const { get } = useEventsApi();
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: get,
    placeholderData: [],
  });
  const { updatePageProps } = useContext(AuthContext);
  const [newEvent, setNewEvent] = useState(false);
  const [search, setSearch] = useState("");

  const onSearch = useCallback((sr: string) => {
    setSearch(sr.toLocaleLowerCase());
  }, []);

  useEffect(() => {
    if (!updatePageProps) return;

    updatePageProps({
      title: "Events",
      onNew() {
        setNewEvent(true);
      },
      hasExports: false,
      onSearch,
    });
  }, [updatePageProps, onSearch]);

  return (
    <Fragment>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] h-fit max-h-[calc(100%_-_43px)] p-[10px] overflow-y-auto">
        {(data as EventType[])?.flatMap((e) => {
          if (!e.eventName.toLocaleLowerCase().includes(search)) {
            return [];
          }

          return (
            <EventCard
              event={e}
              key={e.eventId}
              onClick={() => {
                navigate(`/events/${e.eventId}/overview`);
              }}
            />
          );
        })}
      </div>
      {newEvent ? (
        <EventForm
          open={newEvent}
          onCancel={() => {
            setNewEvent(false);
          }}
        />
      ) : null}
    </Fragment>
  );
}

export default EventsView;
