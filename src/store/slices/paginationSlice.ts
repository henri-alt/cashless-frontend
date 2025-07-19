import { StateCreator } from "zustand";
import { PaginationInfo } from "@/types";

type Pagination = PaginationInfo["pagination"];

export interface PaginationSlice {
  pagination: Record<string, Pagination>;
  setPagination: (id: string, info: Partial<Omit<Pagination, "id">>) => void;
  removePagination: (id: string) => void;
}

export const paginationSlice: StateCreator<
  PaginationSlice,
  [],
  [],
  PaginationSlice
> = (set) => {
  return {
    pagination: {},
    removePagination(id) {
      return set((state) => {
        if (!(id in state.pagination)) {
          return state;
        }

        const tmp = { ...state.pagination };
        delete tmp[id];

        return { pagination: tmp };
      });
    },
    setPagination(id, info) {
      return set((state) => {
        return {
          pagination: {
            ...state.pagination,
            [id]: {
              ...(state.pagination[id] || {}),
              ...info,
            },
          },
        };
      });
    },
  };
};
