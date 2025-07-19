import { useCallback } from "react";
import axios from "axios";
import {
  TopUp,
  BalanceType,
  GetBalancesQuery,
  GetBalancesResponse,
  DeleteBalanceResponse,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import useStore from "@/store";

type UseBalancesApiParam = GetBalancesQuery & { pageId?: string };

interface DeleteBalanceQuery {
  balanceId: string;
  scanId: string;
  isFidelityCard: boolean;
}

export function useBalancesApi(params: UseBalancesApiParam) {
  const client = useQueryClient();
  const { setPagination } = useStore();

  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetBalancesResponse>("/balances", {
        params,
      })
      .then((r) => {
        setPagination(params.pageId || "", {
          ...r.data.pagination,
        });

        return r.data?.balances || [];
      });
  }, [params, setPagination]);

  const remove = useCallback(async (query: DeleteBalanceQuery) => {
    if (query.isFidelityCard) {
      throw new Error(
        "Cannot delete client balance. This balance will be delete once the related client is deleted as well"
      );
    }

    return axios
      .delete<DeleteBalanceResponse>(`/balances/${query.balanceId}`)
      .then((res) => res.data);
  }, []);

  const removeAllBalances = useCallback(async (eventId: string) => {
    return axios
      .delete<DeleteBalanceResponse>(`/balances/event/${eventId}`)
      .then((res) => {
        return res.data;
      });
  }, []);

  return {
    get,
    remove: useMutation({
      mutationFn: remove,
      onSuccess(_, variables) {
        let foundBalance: BalanceType | undefined;

        client.setQueriesData(
          { queryKey: ["balances", params.eventId] },
          (oldData?: BalanceType[]) => {
            const balanceIndex = (oldData || []).findIndex(
              (e) => e.balanceId === variables.balanceId
            );

            if (balanceIndex === -1) return oldData;

            const tmp = [...(oldData || [])];
            foundBalance = tmp.splice(balanceIndex, 1).at(0)!;

            return tmp;
          }
        );

        if (!foundBalance) return;

        client.setQueriesData(
          { queryKey: ["topUps", params.eventId] },
          (oldData?: TopUp[]) => {
            return (oldData || []).filter(
              (e) => e.scanId !== foundBalance?.scanId
            );
          }
        );
      },
      onError(err) {
        console.error("Error deleting balance: ", err);
        if (!("status" in err)) {
          toast({
            variant: "destructive",
            title: "Unable to delete balance",
            description: err.message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Delete balance error",
            description:
              "Something went wrong while trying to delete this balance, please try again later",
          });
        }
      },
    }),
    removeEventBalances: useMutation({
      mutationFn: removeAllBalances,
      onSuccess(_, eventId) {
        client.invalidateQueries({
          queryKey: ["topUps", eventId],
        });

        client.invalidateQueries({
          queryKey: ["balances", eventId],
        });
      },
      onError(error) {
        console.error("Error deleting event balances: ", error);

        toast({
          variant: "destructive",
          title: "Delete balances error",
          description:
            "Something went wrong while trying to delete event balances, please try again later",
        });
      },
    }),
  };
}
