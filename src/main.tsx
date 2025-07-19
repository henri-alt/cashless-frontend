import { StrictMode } from "react";
import axios from "axios";
import { createRoot } from "react-dom/client";
import { ThemeProvider, QueryProvider, router } from "@providers";
import { RouterProvider } from "react-router-dom";
import useStore from "@/store";

import "./index.css";

axios.defaults.baseURL = import.meta.env.VITE_API_URL!;
axios.defaults.timeout = 30_000;
axios.interceptors.request.use((config) => {
  if (config["headers"]) {
    const persistentState = localStorage.getItem(
      import.meta.env.VITE_TOKEN_KEY!
    );

    const token = JSON.parse(persistentState!)?.state?.token;
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (response) => {
    if (
      typeof response.response.data === "string" &&
      response.response.data.includes("token")
    ) {
      useStore.getState().removeToken();
      useStore.getState().removeAdmin();
      router.navigate("/login");
    }

    return Promise.reject(response);
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);
