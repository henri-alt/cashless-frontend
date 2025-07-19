import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  Store,
  adminSlice,
  tokenSlice,
  filterSlice,
  paginationSlice,
} from "./slices";

const useStore = create<Store>()(
  devtools(
    persist(
      (...args) => {
        return {
          ...adminSlice(...args),
          ...tokenSlice(...args),
          ...filterSlice(...args),
          ...paginationSlice(...args),
        };
      },
      {
        name: import.meta.env.VITE_TOKEN_KEY,
        partialize(state) {
          return {
            admin: state.admin,
            token: state.token,
          };
        },
      }
    )
  )
);

export default useStore;
