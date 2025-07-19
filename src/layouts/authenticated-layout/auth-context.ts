import { createContext } from "react";
import { type AuthPageProps } from "@/layouts/authenticated-layout/authenticated-layout";

export const AuthContext = createContext<AuthPageProps>({ title: "Events" });
