import { StateCreator } from "zustand";
import { AdminType } from "@types";

type PartialAdmin = Omit<AdminType, "memberPassword"> | undefined;

export interface AdminSlice {
  admin: PartialAdmin | undefined;
  setAdmin: (admin: PartialAdmin) => void;
  removeAdmin: () => void;
}

export const adminSlice: StateCreator<AdminSlice, [], [], AdminSlice> = (
  set
) => {
  return {
    admin: undefined,
    setAdmin(admin) {
      return set((state) => ({ ...state, admin }), true);
    },
    removeAdmin() {
      return set((state) => ({ ...state, admin: undefined }), true);
    },
  };
};
