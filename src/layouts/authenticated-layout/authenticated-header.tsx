import { singularize } from "@/utils";
import { Button } from "@/components/ui/button";
import { DarkModeIcon, LogoutIcon } from "@/assets";
import { useTheme } from "@/providers";
import { SearchExportSection } from "@/layouts/authenticated-layout/header-search-export-section";
import { useAuthenticationApi } from "@/services/api";
import { useIsMobile } from "@/hooks";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  ViewFilter,
  type ViewFilterProps,
} from "@/components/view-components/view-filter/view-filter";

export interface AuthenticatedHeaderProps {
  title: string;
  hasNew?: boolean;
  onNew?: () => void;
  showTitle?: boolean;
  hasSearch?: boolean;
  searchPosition?: "left" | "right";
  customTitle?: React.ReactNode;
  onSearch?: (search: string) => void;
  customHeaderActions?: React.ReactNode;
  hasExports?: boolean;
  exportsPosition?: "left" | "right";
  onPdfExport?: () => void;
  onExcelExport?: () => void;
  customButtonText?: string;
  hasFilter?: boolean;
  filterProps?: ViewFilterProps;
}

export function AuthenticatedHeader(props: AuthenticatedHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthenticationApi();
  const isMobile = useIsMobile();

  const {
    title,
    customHeaderActions,
    hasNew = true,
    hasSearch = true,
    onNew,
    onSearch,
    showTitle = true,
    customTitle = null,
    searchPosition = "left",
    hasExports = true,
    exportsPosition = "left",
    onExcelExport,
    onPdfExport,
    customButtonText,
    hasFilter = false,
    filterProps,
  } = props;

  return (
    <div className="flex flex-row justify-between items-center flex-nowrap px-5 gap-9 max-w-[100vw] overflow-x-auto">
      <section className="flex flex-row gap-5 justify-start items-center whitespace-nowrap">
        {showTitle ? (
          customTitle ? (
            customTitle
          ) : isMobile ? (
            <SidebarTrigger />
          ) : (
            <span className="font-semibold text-2xl">{title}</span>
          )
        ) : null}
        <SearchExportSection
          title={title}
          hasExports={hasExports && exportsPosition === "left"}
          hasSearch={hasSearch && searchPosition === "left"}
          onExcelExport={onExcelExport}
          onPdfExport={onPdfExport}
          onSearch={onSearch}
        />
      </section>
      <section className="flex flex-row gap-5 justify-end">
        <div className="flex flex-row gap-[10px] items-center">
          <SearchExportSection
            title={title}
            hasExports={hasExports && exportsPosition === "right"}
            hasSearch={hasSearch && searchPosition === "right"}
            onExcelExport={onExcelExport}
            onPdfExport={onPdfExport}
            onSearch={onSearch}
          />
          {hasFilter && filterProps ? <ViewFilter {...filterProps} /> : null}
          {customHeaderActions}
          {hasNew ? (
            <Button
              onClick={() => {
                if (onNew) onNew();
              }}
            >
              {customButtonText
                ? customButtonText
                : `Add ${singularize(title)}`}
            </Button>
          ) : null}
        </div>
        <Button
          className="bg-transparent hover:bg-transparent px-0"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          <DarkModeIcon className="[&>path]:fill-primary" />
        </Button>
        <Button
          className="bg-transparent hover:bg-transparent px-0"
          onClick={() => {
            logout();
          }}
        >
          <LogoutIcon className="[&>path]:fill-primary" />
        </Button>
      </section>
    </div>
  );
}
