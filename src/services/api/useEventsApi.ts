import { useCallback } from "react";
import axios from "axios";
import {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventResponse,
  EventType,
  GetAllEventsResponse,
  PatchEventRequest,
  PatchEventResponse,
} from "@/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EventData extends PatchEventRequest {
  eventId?: string;
}

interface EventsApiParam {
  eventId?: string;
}

interface ChangeStatusParam {
  eventId?: string;
  eventStatus: "active" | "inactive";
}

export function useEventsApi(param = {} as EventsApiParam) {
  const client = useQueryClient();
  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetAllEventsResponse | EventType>(
        param.eventId ? `/events/${param.eventId}` : "/events"
      )
      .then((res) => {
        return res.data;
      });
  }, [param.eventId]);

  const post = useCallback(async (eventData: CreateEventRequest) => {
    return axios
      .post<CreateEventResponse>("/events", { ...eventData })
      .then((res) => {
        const { eventId } = res.data;
        return {
          ...eventData,
          eventStatus: "inactive",
          eventId,
        };
      });
  }, []);

  const patch = useCallback(
    async (eventData?: EventData) => {
      return axios
        .patch<PatchEventResponse>(
          `/events/${eventData?.eventId || param?.eventId}`,
          {
            ...eventData,
          }
        )
        .then((res) => {
          return res.data;
        });
    },
    [param.eventId]
  );

  const deleteEvent = useCallback(
    async (eventData?: EventData) => {
      return axios
        .delete<DeleteEventResponse>(
          `/events/${eventData?.eventId || param?.eventId}`
        )
        .then((res) => res.data);
    },
    [param.eventId]
  );

  const changeEventStatus = useCallback(
    async (data: ChangeStatusParam) => {
      const { eventStatus, eventId } = data;

      return axios
        .patch<PatchEventResponse>(`/events/${eventId || param.eventId}`, {
          eventStatus,
        })
        .then((res) => res.data);
    },
    [param.eventId]
  );

  return {
    get,
    changeEventStatus: useMutation({
      mutationFn: changeEventStatus,
      onSuccess(_, variables) {
        const eventId = variables.eventId || param.eventId;

        if (!eventId) return;

        client.setQueryData(["events"], (data: EventType[]) => {
          const tmp = [...(data || [])];
          const index = tmp.findIndex((e) => e.eventId === eventId);
          if (index === -1) {
            return data;
          }

          tmp[index] = {
            ...tmp[index],
            ...variables,
          };

          return tmp;
        });

        client.setQueryData(["events", eventId], (oldData?: EventType) => {
          if (!oldData) return;

          return {
            ...oldData,
            ...variables,
          };
        });
      },
      onError(err) {
        console.error("Error updating event: ", err);
        toast({
          variant: "destructive",
          title: "Edit event error",
          description:
            "Something went wrong while trying to edit this event, please try again later",
        });
      },
    }),
    create: useMutation({
      mutationFn: post,
      onSuccess(data, variables) {
        client.setQueryData(["events"], (oldEvents: EventType[]) => {
          return [{ ...variables, ...data }, ...(oldEvents || [])];
        });
      },
      onError(err) {
        console.error("Error creating event: ", err);
        toast({
          variant: "destructive",
          title: "Create event error",
          description:
            "Something went wrong while trying to create this event, please try again later",
        });
      },
    }),
    edit: useMutation({
      mutationFn: patch,
      onSuccess(_, variables) {
        const eventId = variables?.eventId || param.eventId;

        if (!eventId) return;

        client.setQueryData(["events"], (data: EventType[]) => {
          const tmp = [...(data || [])];
          const index = tmp.findIndex((e) => e.eventId === eventId);
          if (index === -1) {
            return data;
          }

          tmp[index] = {
            ...tmp[index],
            ...variables,
          };

          return tmp;
        });

        client.setQueryData(["events", eventId], (oldData?: EventType) => {
          if (!oldData) return;

          return {
            ...oldData,
            ...variables,
          };
        });
      },
      onError(err) {
        console.error("Error updating event: ", err);
        toast({
          variant: "destructive",
          title: "Edit event error",
          description:
            "Something went wrong while trying to edit this event, please try again later",
        });
      },
    }),
    remove: useMutation({
      mutationFn: deleteEvent,
      onSuccess(_, variables) {
        if (!variables?.eventId) return;

        const { eventId } = variables;

        client.setQueryData(["events"], (oldData?: EventType[]) => {
          return (oldData || []).filter((e) => e.eventId !== eventId);
        });

        client.removeQueries({
          queryKey: ["events", eventId],
        });
        client.removeQueries({
          queryKey: ["currencies", eventId],
        });
        client.removeQueries({
          queryKey: ["analytics", eventId],
        });
        client.removeQueries({
          queryKey: ["staff", eventId],
        });
        client.removeQueries({
          queryKey: ["menu", eventId],
        });
        client.removeQueries({
          queryKey: ["stands", eventId],
        });
        client.removeQueries({
          queryKey: ["balances", eventId],
        });
        client.removeQueries({
          queryKey: ["topUps", eventId],
        });
        client.removeQueries({
          queryKey: ["transactions", eventId],
        });
      },
      onError(err) {
        console.error("Error deleting event: ", err);
        toast({
          variant: "destructive",
          title: "Delete event error",
          description:
            "Something went wrong while trying to delete this event, please try again later",
        });
      },
    }),
  };
}
