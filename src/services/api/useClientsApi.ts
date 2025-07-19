import { useCallback } from "react";
import axios from "axios";
import {
  BalanceType,
  ClientType,
  DeleteClientResponse,
  GetClientQuery,
  GetClientResponse,
  PatchClientRequest,
  PatchClientResponse,
  TopUp,
  TransactionType,
} from "@/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import useStore from "@/store";

interface ClientsApiParam {
  pageId?: string;
  getParams?: GetClientQuery;
}

interface PatchClientBody extends PatchClientRequest {
  clientId: string;
}

export function useClientsApi(params?: ClientsApiParam) {
  const client = useQueryClient();
  const { toast } = useToast();
  const { setPagination } = useStore();

  const get = useCallback(async () => {
    return axios
      .get<GetClientResponse>("/clients", {
        params: params?.getParams,
      })
      .then((r) => {
        if (params?.pageId) setPagination(params?.pageId, r.data.pagination);

        return r.data.clients;
      });
  }, [params, setPagination]);

  const edit = useCallback(async (updateBody: PatchClientBody) => {
    return axios
      .patch<PatchClientResponse>(`/clients/${updateBody.clientId}`, updateBody)
      .then((r) => r.data);
  }, []);

  const remove = useCallback(
    async (removeData: { clientId: string; balanceId: string }) => {
      return axios
        .delete<DeleteClientResponse>(`/clients/${removeData.clientId}`)
        .then((r) => r.data);
    },
    []
  );

  return {
    get,
    edit: useMutation({
      mutationFn: edit,
      onSuccess(_, variables) {
        client.setQueriesData(
          { queryKey: ["clients"] },
          (data?: ClientType[]) => {
            const tmp = [...(data || [])];
            const index = tmp.findIndex(
              (e) => e.clientId === variables.clientId
            );
            if (index === -1) {
              return data;
            }

            tmp[index] = {
              ...tmp[index],
              ...variables,
            };

            return tmp;
          }
        );
      },
      onError(err) {
        console.error("Error deleting client: ", err);
        toast({
          title: "Edit client error",
          description:
            "Something went wrong while trying to edit this client, please try again later",
          variant: "destructive",
        });
      },
    }),
    remove: useMutation({
      mutationFn: remove,
      onSuccess(_, vars) {
        client.setQueriesData(
          { queryKey: ["clients"] },
          (cl?: ClientType[]) => {
            return (cl || []).filter((e) => e.clientId !== vars.clientId);
          }
        );

        let clientBalance: BalanceType | undefined;

        client.setQueriesData(
          {
            queryKey: ["balances"],
          },
          (oldData?: BalanceType[]) => {
            if (clientBalance) return oldData;

            const index = (oldData || []).findIndex(
              (e) => e.balanceId === vars.balanceId
            );
            if (index === -1) return oldData;

            const tmp = [...(oldData || [])];
            clientBalance = tmp.splice(index, 1).at(0);

            return tmp;
          }
        );

        if (!clientBalance) return;

        client.setQueriesData({ queryKey: ["topUps"] }, (oldData?: TopUp[]) => {
          return (oldData || []).filter(
            (e) => e.scanId !== clientBalance?.scanId
          );
        });
        client.setQueriesData(
          { queryKey: ["transactions"] },
          (oldData?: TransactionType[]) => {
            return (oldData || []).filter(
              (e) => e.scanId !== clientBalance?.scanId
            );
          }
        );
      },
      onError(err) {
        console.error("Error deleting client: ", err);
        toast({
          title: "Delete client error",
          description:
            "Something went wrong while trying to delete this client, please try again later",
          variant: "destructive",
        });
      },
    }),
  };
}
