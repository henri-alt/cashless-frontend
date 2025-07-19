import { StateCreator } from "zustand";

export interface TokenSlice {
  token: string | undefined;
  setToken: (token: string | undefined) => void;
  removeToken: () => void;
}

export const tokenSlice: StateCreator<TokenSlice, [], [], TokenSlice> = (
  set
) => {
  return {
    token: undefined,
    setToken(token) {
      return set((state) => ({ ...state, token }), true);
    },
    removeToken() {
      return set((state) => ({ ...state, token: undefined }), true);
    },
  };
};
