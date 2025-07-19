import { EllipsisIcon } from "@/assets";
import { Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onRemove?: (item: TData) => void;
  onEdit?: (item: TData) => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onRemove,
}: DataTableRowActionsProps<TData>) {
  /**
   * The timeouts on the click handlers were added since the behavior
   * of the actions dropdown and the behavior of the dialog conflict,
   * they attempt to change teh body's style pointer events to "none"
   * causing the page to be frozen. By setting a timeout we leave the
   * dropdown a little time to change the body's style back to normal
   */

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <EllipsisIcon className="h-4 w-4 fill-current" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            if (onEdit) {
              setTimeout(() => {
                onEdit(row.original as TData);
              }, 10);
            }
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            if (onRemove) {
              setTimeout(() => {
                onRemove(row.original as TData);
              }, 10);
            }
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
