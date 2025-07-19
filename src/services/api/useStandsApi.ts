import { useCallback } from "react";
import axios from "axios";
import {
  CreateStandRequest,
  CreateStandResponse,
  DeleteStandResponse,
  GetStandsResponse,
  PatchStandRequest,
  PatchStandResponse,
  StandConfigType,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type UseStandsApiParam = {
  eventId: string;
  standName?: string;
};

interface DeleteStandQuery {
  standName: string;
}

export function useStandsApi(param: UseStandsApiParam) {
  const client = useQueryClient();
  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetStandsResponse>(`/events/${param.eventId}/stands`)
      .then((r) => r.data);
  }, [param.eventId]);

  const create = useCallback(
    async (body: CreateStandRequest) => {
      return axios
        .post<CreateStandResponse>(`/events/${param.eventId}/stands`, body)
        .then((r) => r.data);
    },
    [param.eventId]
  );

  const edit = useCallback(
    async (body: PatchStandRequest) => {
      return axios
        .patch<PatchStandResponse>(`/events/${param.eventId}/stands`, body, {
          params: { standName: param.standName },
        })
        .then((r) => r.data);
    },
    [param.eventId, param.standName]
  );

  const remove = useCallback(
    async (query?: DeleteStandQuery) => {
      return axios
        .delete<DeleteStandResponse>(`/events/${param.eventId}/stands`, {
          params: {
            standName: query?.standName || param.standName,
          },
        })
        .then((r) => r.data);
    },
    [param.eventId, param.standName]
  );

  return {
    get,
    create: useMutation({
      mutationFn: create,
      onSuccess(_, variables) {
        client.setQueryData(
          ["stands", param.eventId],
          (oldStands: StandConfigType[]) => {
            return [{ ...variables }, ...(oldStands || [])];
          }
        );
      },
      onError(error) {
        console.error("Error stand: ", error);
        toast({
          variant: "destructive",
          title: "Create stand error",
          description:
            "Something went wrong while trying to create stand, please try again later",
        });
      },
    }),
    edit: useMutation({
      mutationFn: edit,
      onSuccess(_, variables) {
        client.setQueryData(
          ["stands", param.eventId],
          (oldData: StandConfigType[]) => {
            const tmp = [...(oldData || [])];
            const index = tmp.findIndex((e) => e.standName === param.standName);
            if (index === -1) return oldData;

            tmp[index] = {
              ...tmp[index],
              ...variables,
            };

            return tmp;
          }
        );
      },
      onError(error) {
        console.error("Error stand: ", error);
        toast({
          variant: "destructive",
          title: "Edit stand error",
          description:
            "Something went wrong while trying to edit stand, please try again later",
        });
      },
    }),
    remove: useMutation({
      mutationFn: remove,
      onSuccess(_, variables) {
        client.setQueryData(
          ["stands", param.eventId],
          (oldData: StandConfigType[]) => {
            const id = variables?.standName || param.standName;

            return (oldData || []).filter((e) => e.standName !== id);
          }
        );
      },
      onError(error) {
        console.error("Error stand: ", error);
        toast({
          variant: "destructive",
          title: "Remove stand error",
          description:
            "Something went wrong while trying to remove stand, please try again later",
        });
      },
    }),
  };
}
