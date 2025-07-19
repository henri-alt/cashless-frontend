import { StateCreator } from "zustand";

export interface FilterSlice {
  filters: Record<string, Record<string, unknown>>;
  setFilter: (key: string, filters: Record<string, unknown>) => void;
  removeFilter: (key: string) => void;
}

export const filterSlice: StateCreator<FilterSlice, [], [], FilterSlice> = (
  set
) => {
  return {
    filters: {},
    removeFilter(key) {
      return set((state) => {
        if (!(key in state.filters)) {
          return state;
        }

        const tmp = { ...state.filters };
        delete tmp[key];

        return { filters: tmp };
      });
    },
    setFilter(key, filters) {
      return set((state) => {
        return {
          filters: {
            ...state.filters,
            [key]: filters,
          },
        };
      });
    },
  };
};
