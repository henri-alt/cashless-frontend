import { useCallback } from "react";
import axios from "axios";
import {
  CurrencyType,
  CurrencyBody,
  GetCurrenciesResponse,
  CreateCurrencyRequest,
  CreateCurrenciesResponse,
} from "@/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UseCurrenciesParam {
  eventId: string;
}

interface PostCurrenciesParam {
  eventId?: string;
  currencies: CreateCurrencyRequest;
}

export function useCurrenciesApi(param: UseCurrenciesParam) {
  const client = useQueryClient();
  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetCurrenciesResponse>(`/events/${param.eventId}/currencies`)
      .then((res) => res.data);
  }, [param.eventId]);

  const update = useCallback(
    async (postParam: PostCurrenciesParam) => {
      return axios
        .post<CreateCurrenciesResponse>(
          `/events/${postParam?.eventId || param.eventId}/currencies`,
          postParam.currencies
        )
        .then((res) => res.data);
    },
    [param.eventId]
  );

  return {
    get,
    update: useMutation({
      mutationFn: update,
      onSuccess(data, vars) {
        if (Array.isArray(vars.currencies)) {
          /**
           * in this case the user posted all the event currencies on the same request,
           * if there are new currencies, the currency ids are returned in the response
           */
          const newIdsData = data.reduce(
            (acc, val) => ({
              ...acc,
              [val.currency]: val,
            }),
            {} as Record<string, { currency: string; currencyId: string }>
          );

          const tmp = [...vars.currencies];

          tmp.forEach((currency) => {
            if (!(currency.currency in newIdsData)) {
              return;
            }

            currency.currencyId = newIdsData[currency.currency]["currencyId"];
          });

          client.setQueryData(["currencies", param.eventId], () => {
            return tmp;
          });
        } else {
          client.setQueryData(
            ["currencies", param.eventId],
            (oldData?: CurrencyType[]) => {
              const currency = vars.currencies as CurrencyBody;

              const index = (oldData || []).findIndex(
                (e) => e.currencyId === currency.currencyId
              );

              if (index < 0) return oldData;

              const tmp = [...(oldData || [])];
              tmp[index] = {
                ...tmp[index],
                ...currency,
              };

              return tmp;
            }
          );
        }
      },
      onError(err) {
        console.error("Currencies error: ", err);
        toast({
          title: "Currencies Error",
          description:
            "Something went wrong while trying to process event currencies, please try again later",
          variant: "destructive",
        });
      },
    }),
  };
}
