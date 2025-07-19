import { useCallback } from "react";
import axios from "axios";
import {
  StaffMember,
  CreateStaffRequest,
  CreateMemberResponse,
  DeleteMemberResponse,
  GetStaffResponse,
  PatchStaffRequest,
  PatchMemberResponse,
  StandConfigType,
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type UseStaffParam = {
  eventId: string;
  memberId?: string;
};

type StaffDeleteQuery = {
  memberId?: string;
};

export function useStaffApi(param: UseStaffParam) {
  const client = useQueryClient();
  const { toast } = useToast();

  const get = useCallback(async () => {
    return axios
      .get<GetStaffResponse>(
        param?.memberId ? `/staffMembers/${param.memberId}` : "/staffMembers",
        {
          params: {
            eventId: param.eventId,
          },
        }
      )
      .then((r) => r.data);
  }, [param.eventId, param.memberId]);

  const create = useCallback(async (body: CreateStaffRequest) => {
    return axios
      .post<CreateMemberResponse>("/staffMembers", body)
      .then((r) => r.data);
  }, []);

  const edit = useCallback(
    async (body: PatchStaffRequest) => {
      return axios
        .patch<PatchMemberResponse>(`/staffMembers/${param?.memberId}`, body)
        .then((r) => r.data);
    },
    [param.memberId]
  );

  const remove = useCallback(
    async (query?: StaffDeleteQuery) => {
      const id = query?.memberId || param.memberId;

      const stands: StandConfigType[] =
        client.getQueryData(["stands", param.eventId]) || [];

      const singleStand = stands.find(
        (e) => e.staffMembers.length === 1 && e.staffMembers.at(0) === id
      );

      if (singleStand) {
        throw new Error(
          `Stand "${singleStand.standName}" only has this one member. Please delete "${singleStand.standName}" before this staff`
        );
      }

      return axios
        .delete<DeleteMemberResponse>(`/staffMembers/${id}`)
        .then((r) => r.data);
    },
    [param.memberId, param.eventId, client]
  );

  return {
    get,
    create: useMutation({
      mutationFn: create,
      onSuccess(data, variables) {
        client.setQueryData(
          ["staff", param.eventId],
          (oldData: StaffMember[]) => {
            return [{ ...variables, ...data }, ...(oldData || [])];
          }
        );
      },
      onError(err) {
        console.error("Error creating staff: ", err);
        toast({
          variant: "destructive",
          title: "Create staff error",
          description:
            "Something went wrong while trying to create this staff, please try again later",
        });
      },
    }),
    edit: useMutation({
      mutationFn: edit,
      onSuccess(_, variables) {
        client.setQueryData(
          ["staff", param.eventId],
          (oldData: StaffMember[]) => {
            const tmp = [...(oldData || [])];
            const index = tmp.findIndex((e) => e.memberId === param.memberId);
            if (index === -1) return oldData;

            tmp[index] = {
              ...tmp[index],
              ...variables,
            };

            return tmp;
          }
        );
      },
      onError(err) {
        console.error("Error editing staff: ", err);
        toast({
          variant: "destructive",
          title: "Update staff error",
          description:
            "Something went wrong while trying to update this staff, please try again later",
        });
      },
    }),
    remove: useMutation({
      mutationFn: remove,
      onSuccess(_, variables) {
        const id = variables?.memberId || param.memberId;

        client.setQueryData(
          ["staff", param.eventId],
          (oldData: StaffMember[]) => {
            return (oldData || []).filter((e) => e.memberId !== id);
          }
        );

        client.setQueryData(
          ["stands", param.eventId],
          (oldData?: StandConfigType[]) => {
            const hasStands = (oldData || []).find((e) =>
              e.staffMembers.includes(id!)
            );
            if (!hasStands) return oldData;

            const tmp = [...(oldData || [])];
            for (const stand of tmp) {
              if (!stand.staffMembers.includes(id!)) continue;

              stand.staffMembers = stand.staffMembers.filter((e) => e !== id);
            }

            return tmp;
          }
        );
      },
      onError(err) {
        console.error("Error deleting staff: ", err);

        if (!("status" in err)) {
          toast({
            variant: "destructive",
            title: "Unable to delete staff",
            description: err.message,
          });

          return;
        }

        toast({
          variant: "destructive",
          title: "Delete staff error",
          description:
            "Something went wrong while trying to delete this staff, please try again later",
        });
      },
    }),
  };
}
