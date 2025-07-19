import { Fragment } from "react";
import { singularize } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PdfIcon, ExcelIcon } from "@/assets";

type SearchExportSectionProps = {
  title: string;
  hasSearch?: boolean;
  hasExports?: boolean;
  onSearch?: (search: string) => void;
  onPdfExport?: () => void;
  onExcelExport?: () => void;
};

export function SearchExportSection(props: SearchExportSectionProps) {
  if (!props.hasSearch && !props.hasExports) return null;

  return (
    <div className="flex flex-row gap-[10px]">
      {props.hasSearch ? (
        <Input
          placeholder={`Search ${singularize(props.title)}`}
          onChange={(e) => {
            if (props.onSearch) props.onSearch(e.target.value);
          }}
          className="w-[76px] md:w-full"
        />
      ) : null}
      {props.hasExports ? (
        <Fragment>
          {props.onPdfExport ? (
            <Button
              onClick={() => {
                if (props.onPdfExport) props.onPdfExport();
              }}
              className={
                "h-full bg-sidebar-accent hover:bg-sidebar-accent text-[--sidebar-accent-foreground] [&>svg]:fill-current [&>path]:fill-current"
              }
            >
              <PdfIcon height={24} width={24} />
            </Button>
          ) : null}
          {props.onExcelExport ? (
            <Button
              onClick={() => {
                if (props.onExcelExport) props.onExcelExport();
              }}
              className={
                "h-full bg-sidebar-accent hover:bg-sidebar-accent text-[--sidebar-accent-foreground] [&>svg]:fill-current [&>path]:fill-current"
              }
            >
              <ExcelIcon height={24} width={24} />
            </Button>
          ) : null}
        </Fragment>
      ) : null}
    </div>
  );
}
