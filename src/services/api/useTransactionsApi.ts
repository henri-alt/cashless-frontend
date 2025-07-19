import { useCallback } from "react";
import axios from "axios";
import { GetTransactionsQuery, GetTransactionsResponse } from "@/types";
import useStore from "@/store";

interface UseTransactionsApiParam extends Partial<GetTransactionsQuery> {
  eventId: string;
  pageId?: string;
}

export function useTransactionsApi(params: UseTransactionsApiParam) {
  const { setPagination } = useStore();

  const get = useCallback(async () => {
    return axios
      .get<GetTransactionsResponse>("/transactions", {
        params,
      })
      .then((res) => {
        if (params.pageId) setPagination(params.pageId, res.data.pagination);

        return res.data.transactions;
      });
  }, [params, setPagination]);

  return { get };
}
