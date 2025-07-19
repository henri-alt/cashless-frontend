import { useCallback } from "react";
import axios from "axios";
import { GetTopUpsQuery, GetTopUpsResponse } from "@/types";
import useStore from "@/store";

interface UseTopUpsApiParam extends GetTopUpsQuery {
  pageId?: string;
}

export function useTopUpsApi(params: UseTopUpsApiParam) {
  const { setPagination } = useStore();

  const get = useCallback(async () => {
    return axios
      .get<GetTopUpsResponse>("/topUps", {
        params,
      })
      .then((res) => {
        if (params.pageId) setPagination(params.pageId, res.data.pagination);

        return res.data.topUps;
      });
  }, [params, setPagination]);

  return { get };
}
