import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  AuthenticatedHeader,
  AuthenticatedHeaderProps,
} from "./authenticated-header";
import { AuthenticatedSidebar } from "./authenticated-sidebar";
import { AuthContext } from "@/layouts/authenticated-layout/auth-context";

type BasePageProps = AuthenticatedHeaderProps;

export interface AuthPageProps extends BasePageProps {
  updatePageProps?: React.Dispatch<React.SetStateAction<AuthPageProps>>;
}

const initPageProps: BasePageProps = {
  title: "Events",
  hasNew: true,
  hasSearch: true,
  onNew() {},
  onSearch() {},
};

function AuthenticatedLayout() {
  const [pageProps, setPageProps] = useState<AuthPageProps>({
    ...initPageProps,
  });

  return (
    <AuthContext.Provider
      value={{ ...pageProps, updatePageProps: setPageProps }}
    >
      <SidebarProvider className="w-[100vw]">
        <main className="w-full flex flex-row flex-nowrap">
          <AuthenticatedSidebar />
          <section className="w-full grid grid-rows-[76px_calc(100dvh_-_36px)] grid-cols-1">
            <AuthenticatedHeader {...pageProps} />
            <Outlet />
          </section>
        </main>
      </SidebarProvider>
    </AuthContext.Provider>
  );
}

export default AuthenticatedLayout;
