import { useCallback } from "react";
import axios from "axios";
import {
  GetMemberResponse,
  LoginMemberResponse,
  MemberLoginRequest,
} from "@/types";
import useStore from "@/store";
import { router } from "@/providers";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type AdminType = GetMemberResponse & { userClass: 0 };
type AdminLoginResponse = LoginMemberResponse & { member: AdminType };

export function useAuthenticationApi() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const login = useCallback(async (loginData: MemberLoginRequest) => {
    return axios
      .post<AdminLoginResponse>("/staffMembers/login", loginData)
      .then((res) => res.data);
  }, []);

  const logout = useCallback(() => {
    useStore.getState().removeAdmin();
    useStore.getState().removeToken();

    setTimeout(() => {
      navigate("/login");
    }, 50);
  }, [navigate]);

  const getProfile = useCallback(async () => {
    return axios.post<AdminType>("/staffMembers/profile").then((res) => {
      const admin = res.data;
      useStore.getState().setAdmin(admin);

      return admin;
    });
  }, []);

  return {
    login: useMutation({
      mutationFn: login,
      onSuccess(data) {
        const { member, token } = data;

        useStore.getState().setAdmin(member);
        useStore.getState().setToken(token);

        router.navigate("/events");
      },
      onError(error) {
        console.error("Error logging in: ", error);
        toast({
          title: "Login error",
          description: "Could not login, please check your credentials",
          variant: "destructive",
        });
      },
    }),
    logout,
    getProfile,
  };
}
