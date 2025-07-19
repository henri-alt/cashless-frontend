import {
  Sidebar,
  useSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { RightArrows } from "@/assets";
import { authSideItems } from "./auth-sidebar-items";
import { useNavigate, useLocation } from "react-router-dom";
import { CompanyLogo } from "@/assets";
import { cn } from "@/lib/utils";

export function AuthenticatedSidebar() {
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex items-center",
          sidebarState === "collapsed"
            ? "justify-end h-17"
            : "justify-center h-[150px]"
        )}
      >
        <CompanyLogo
          className={cn(
            sidebarState === "collapsed" ? "h-16 w-16" : "h-[100px] w-[100px]"
          )}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex justify-center items-center p-0">
          <SidebarGroupContent>
            <SidebarMenu className={sidebarState === "expanded" ? "px-5" : ""}>
              {authSideItems.map((e) => (
                <SidebarMenuItem
                  key={e.title}
                  className={cn(
                    "h-11",
                    sidebarState === "collapsed"
                      ? "flex justify-center items-center"
                      : ""
                  )}
                >
                  <SidebarMenuButton
                    onClick={() => {
                      navigate(e.url);
                    }}
                    isActive={location.pathname.includes(e.url)}
                    className={cn(
                      "h-full [&>svg]:fill-current [&>path]:fill-current",
                      sidebarState === "collapsed"
                        ? "group-data-[collapsible=icon]:!px-1"
                        : ""
                    )}
                    tooltip={e.title}
                  >
                    <e.icon height={24} width={24} />
                    {sidebarState === "expanded" ? (
                      <span className="text-base font-normal">{e.title}</span>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="items-center justify-start h-[82px]">
        <SidebarTrigger className="h-8 w-8">
          <RightArrows
            fill="fill-primary [&>path]:fill-primary"
            className={cn(
              "size-8 [&>path]:fill-primary",
              sidebarState === "expanded" ? "rotate-180" : ""
            )}
          />
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}
