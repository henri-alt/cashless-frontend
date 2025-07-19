import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  GetItemsResponse,
  PostItemsRequest,
  PostItemsResponse,
  PatchItemRequest,
  PatchItemsResponse,
  DeleteItemResponse,
  ItemConfig,
  StandConfigType,
} from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseMenuItemsApiParam {
  eventId: string;
}

type PatchItemParam = {
  itemName: string;
  updateBody: PatchItemRequest;
};

type DeleteItemQuery = {
  itemName?: string;
};

export function useMenuItemsApi(param: UseMenuItemsApiParam) {
  const client = useQueryClient();
  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetItemsResponse>(`/events/${param.eventId}/items`)
      .then((r) => r.data);
  }, [param.eventId]);

  const create = useCallback(
    async (items: PostItemsRequest) => {
      return axios
        .post<PostItemsResponse>(`/events/${param.eventId}/items`, items)
        .then((r) => r.data);
    },
    [param.eventId]
  );

  const edit = useCallback(
    async (data: PatchItemParam) => {
      return axios
        .patch<PatchItemsResponse>(
          `/events/${param.eventId}/items`,
          data.updateBody,
          {
            params: {
              itemName: data.itemName,
            },
          }
        )
        .then((r) => r.data);
    },
    [param.eventId]
  );

  const remove = useCallback(
    async (query: DeleteItemQuery) => {
      const stands: StandConfigType[] =
        client.getQueryData(["stands", param.eventId]) || [];

      const singleStand = stands.find(
        (e) => e.menuItems.length === 1 && e.menuItems.at(0) === query.itemName
      );

      if (singleStand) {
        throw new Error(
          `Stand "${singleStand.standName}" only has this one item. Please delete "${singleStand.standName}" before this item`
        );
      }

      return axios
        .delete<DeleteItemResponse>(`/events/${param.eventId}/items`, {
          params: {
            itemName: query.itemName,
          },
        })
        .then((r) => r.data);
    },
    [param.eventId, client]
  );

  return {
    get,
    create: useMutation({
      mutationFn: create,
      onSuccess(_, variables) {
        client.setQueryData(["menu", param.eventId], (data: ItemConfig[]) => {
          const postItemMap: Record<string, ItemConfig> = variables.reduce(
            (acc, val) => ({
              ...acc,
              [val.itemName]: val,
            }),
            {}
          );

          const presentItems = new Set((data || []).map((e) => e.itemName));

          return (data || [])
            .map((e) => {
              if (!(e.itemName in postItemMap)) {
                return e;
              }

              return {
                ...e,
                ...postItemMap[e.itemName],
              };
            })
            .concat(
              Object.values(postItemMap).flatMap((e) => {
                if (presentItems.has(e.itemName)) {
                  return [];
                }

                return {
                  ...e,
                  eventId: param.eventId,
                };
              })
            );
        });
      },
      onError(error) {
        console.error("Error creating items: ", error);
        toast({
          title: "Create items error",
          description:
            "Something went wrong while trying to create menu items, please try again later",
          variant: "destructive",
        });
      },
    }),
    edit: useMutation({
      mutationFn: edit,
      onSuccess(_, variables) {
        client.setQueryData(["menu", param.eventId], (data: ItemConfig[]) => {
          const tmp = [...(data || [])];
          const index = tmp.findIndex((e) => e.itemName === variables.itemName);
          if (index === -1) return data;

          tmp[index] = {
            ...tmp[index],
            ...variables["updateBody"],
          };

          return tmp;
        });

        if (variables.itemName === variables?.updateBody?.itemName) return;

        client.setQueryData(
          ["stands", param.eventId],
          (oldData?: StandConfigType[]) => {
            const hasStands = (oldData || []).find((e) =>
              e.menuItems.includes(variables.itemName!)
            );

            if (!hasStands) return oldData;

            const tmp = [...(oldData || [])];
            for (const stand of tmp) {
              const index = stand.menuItems.findIndex(
                (e) => e === variables.itemName
              );

              if (index === -1) {
                continue;
              }

              stand.menuItems[index] =
                variables.updateBody.itemName || variables.itemName;
            }

            return tmp;
          }
        );
      },
      onError(error) {
        console.error("Error editing items: ", error);
        toast({
          title: "Update item error",
          description:
            "Something went wrong while trying to update menu items, please try again later",
          variant: "destructive",
        });
      },
    }),
    remove: useMutation({
      mutationFn: remove,
      onSuccess(_, variables) {
        client.setQueryData(["menu", param.eventId], (data: ItemConfig[]) => {
          return (data || []).filter((e) => e.itemName !== variables.itemName);
        });

        client.setQueryData(
          ["stands", param.eventId],
          (oldData?: StandConfigType[]) => {
            const hasStands = (oldData || []).find((e) =>
              e.menuItems.includes(variables.itemName!)
            );
            if (!hasStands) return oldData;

            const tmp = [...(oldData || [])];
            for (const stand of tmp) {
              if (!stand.menuItems.includes(variables.itemName!)) continue;

              stand.menuItems = stand.menuItems.filter(
                (e) => e !== variables.itemName
              );
            }

            return tmp;
          }
        );
      },
      onError(error) {
        console.error("Error deleting items: ", error);

        if (!("status" in error)) {
          toast({
            title: "Unable to  delete menu item",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Delete item error",
            description:
              "Something went wrong while trying to delete this item, please try again later",
            variant: "destructive",
          });
        }
      },
    }),
  };
}
