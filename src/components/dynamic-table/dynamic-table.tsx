import React, {
  useState,
  useEffect,
  forwardRef,
  Dispatch,
  useRef,
  useCallback,
  SetStateAction,
  useImperativeHandle,
} from "react";
import {
  Table,
  ColumnDef,
  flexRender,
  SortingState,
  useReactTable,
  VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import {
  Table as TableComponent,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationFirstPage,
  PaginationItem,
  PaginationLastPage,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { DownSortArrow } from "@/assets";
import { cn } from "@/lib/utils";
import useStore from "@/store";

interface DynamicTableProps<T = unknown> {
  className?: string;
  tableData: T[];
  rowId?: string;
  headerColumns: ColumnDef<T>[];
  isLoading?: boolean;
  serverSidePagination?: boolean;
  paginationKey?: string;
}

interface ActionType<T = unknown> {
  items: T[] | T;
}

interface AddActionType<T = unknown> extends ActionType<T> {
  index?: number;
}

interface TransactionAction<T> {
  edit: (prop: ActionType<T>) => void;
  add: (prop: AddActionType<T>) => void;
  remove: (prop: ActionType<T>) => void;
  [index: string]: (prop: ActionType<T> & AddActionType<T>) => void;
}

export interface ApplyTransaction<T = unknown> {
  type: "add" | "edit" | "remove";
  items: T[];
  addIndex?: number;
}

export interface DynamicTableRefType<T = unknown> {
  tableApi: Table<T>;
  flashVisibleRows: () => void;
  setTableData: Dispatch<SetStateAction<Array<T>>>;
  applyTransaction: ({ type, items, addIndex }: ApplyTransaction<T>) => void;
  pageSize: number;
}
export const DynamicTable = forwardRef(function DynamicTable<T>(
  props: DynamicTableProps<T>,
  ref: React.ForwardedRef<DynamicTableRefType<T>>
) {
  const {
    rowId,
    tableData,
    className,
    headerColumns,
    isLoading,
    paginationKey,
    serverSidePagination,
  } = props;

  const { pagination: storePagination, setPagination: setStorePagination } =
    useStore();

  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<typeof tableData>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const onEdit = useCallback(
    ({ items }: ActionType<T>) => {
      if (rowId) {
        if (Array.isArray(items)) {
          setData((prev) => {
            return prev.map((el) => {
              const index = items.findIndex(
                (itm) =>
                  itm[rowId as keyof typeof el] === el[rowId as keyof typeof el]
              );
              return index > -1 ? { ...el, ...items[index] } : el;
            });
          });
        } else {
          setData((prev) =>
            prev.map((el) =>
              el[rowId as keyof typeof el] === items[rowId as keyof typeof el]
                ? Object.assign(el as unknown as object, items)
                : el
            )
          );
        }
      }
    },
    [rowId]
  );

  const onRemove = useCallback(
    ({ items }: ActionType<T>) => {
      if (rowId) {
        if (Array.isArray(items)) {
          setData((prev) => {
            return prev.filter((el) => {
              const index = items.findIndex((itm) =>
                typeof itm === "string"
                  ? el[rowId as keyof typeof el] === itm
                  : el[rowId as keyof typeof el] ===
                    itm[rowId as keyof typeof el]
              );
              return index === -1;
            });
          });
        } else {
          setData((prev) =>
            prev.filter(
              (el) =>
                el[rowId as keyof typeof el] !== items[rowId as keyof typeof el]
            )
          );
        }
      }
    },
    [rowId]
  );

  const onAdd = useCallback(({ items, index }: AddActionType<T>) => {
    if (typeof index === "number") {
      setData((prev) => {
        const tmpData = [...prev];
        if (Array.isArray(items)) {
          tmpData.splice(index, 0, ...items);
        } else {
          tmpData.splice(index, 0, items);
        }
        return tmpData;
      });
    } else {
      setData((prev) => prev.concat(items));
    }
  }, []);

  const applyTransaction = useCallback(
    ({ type = "add", items, addIndex }: ApplyTransaction<T>) => {
      const action: TransactionAction<T> = {
        add: onAdd,
        edit: onEdit,
        remove: onRemove,
      };
      action[type]({ items, index: addIndex });
    },
    [onAdd, onRemove, onEdit]
  );

  const table = useReactTable({
    data,
    state: {
      sorting,
      pagination,
      globalFilter,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    meta: {
      onAdd,
      onEdit,
      onRemove,
      applyTransaction,
    },
    rowCount: 1,
    enableFilters: true,
    columns: headerColumns,
    enableRowSelection: true,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  useEffect(() => {
    if (serverSidePagination || !table) return;

    table.options.pageCount = Math.ceil(data?.length / 10);
  }, [serverSidePagination, table, data?.length]);

  const flashVisibleRows = useCallback(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      table.getRowModel().rows.forEach((row) => {
        const tableRow = tableContainer.querySelector(`#row-${row.id}`);

        const keyFrames = [
          { backgroundColor: "#37ecb9b9" },
          { backgroundColor: "transparent" },
        ];

        const timing = {
          duration: 800,
          rangeStart: "cover 0%",
          rangeEnd: "cover 100%",
        };

        tableRow?.animate(keyFrames, timing);
      });
    }
  }, [table]);

  useImperativeHandle(
    ref,
    () => {
      return {
        tableApi: table,
        applyTransaction,
        flashVisibleRows,
        setTableData: setData,
        pageSize: pagination.pageSize,
      };
    },
    [table, applyTransaction, flashVisibleRows, pagination.pageSize]
  );

  let pageCount = table.getPageCount();
  if (
    serverSidePagination &&
    paginationKey &&
    paginationKey in storePagination
  ) {
    pageCount = storePagination[paginationKey]["pages"];
  }

  let pageIndex = pagination.pageIndex;
  if (
    serverSidePagination &&
    paginationKey &&
    paginationKey in storePagination
  ) {
    pageIndex = storePagination[paginationKey]["page"];
  }

  function checkLastPage(): boolean {
    if (!table || isLoading) {
      return false;
    }

    return pageIndex >= pageCount - 1;
  }

  function checkFirstPage(): boolean {
    if (!table || isLoading) {
      return false;
    }

    return pageIndex <= 1;
  }

  function nextPaginationPage(last = false) {
    if (!serverSidePagination || !paginationKey) return;

    const newPage = last
      ? storePagination[paginationKey]["pages"] - 1
      : (storePagination[paginationKey]["page"] || 0) + 1;

    if (newPage < 0) {
      return;
    }

    setStorePagination(paginationKey, {
      page: newPage,
      pageSize: 10,
    });
  }

  function previousPaginationPage(first = false) {
    if (!serverSidePagination || !paginationKey) return;
    if (!storePagination?.[paginationKey]?.["page"]) return;

    const newPage = first
      ? 0
      : (storePagination[paginationKey]["page"] || 0) - 1;
    if (newPage < 0) {
      return;
    }

    setStorePagination(paginationKey, {
      page: newPage,
      pageSize: 10,
    });
  }

  function prevPage(firstPage = false): void {
    if (!table || isLoading) return;

    if (firstPage || checkFirstPage()) {
      previousPaginationPage(true);
      if (!serverSidePagination) {
        table.firstPage();
      }
    } else {
      previousPaginationPage();
      if (!serverSidePagination) {
        table.previousPage();
      }
    }
  }

  function nextPage(lastPage = false): void {
    if (!table || isLoading) return;

    if (lastPage || checkLastPage()) {
      nextPaginationPage(true);
      if (!serverSidePagination) {
        table.lastPage();
      }
    } else {
      nextPaginationPage();
      if (!serverSidePagination) {
        table.nextPage();
      }
    }
  }

  return (
    <section
      className={cn(
        "h-[calc(100%_-_45px)] w-full grid place-items-center",
        className
      )}
    >
      <Card className="h-full w-[calc(100%_-_20px)]">
        <CardContent
          className="p-0 h-[calc(100%_-_60px)] w-full max-w-[calc(100dvw_-_40px)]"
          ref={tableContainerRef}
        >
          <TableComponent className="w-full relative">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        className="!h-[48px] whitespace-nowrap"
                        key={`${header.id}-${index}`}
                        colSpan={header.colSpan}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-[10px] [&>svg]:fill-current">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{
                            asc: (
                              <DownSortArrow
                                style={{ transform: "rotate(180deg)" }}
                              />
                            ),
                            desc: <DownSortArrow />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  id={`row-${row.id}`}
                  key={`${row.id}-${index}`}
                  className="!h-[65px] whitespace-nowrap w-fit"
                  data-state={row.getIsSelected() && "selected"}
                  onDoubleClick={() => row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell, rowIndex) => (
                    <TableCell
                      className="!h-[65px]"
                      key={`${cell.id}-${rowIndex}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
          <Pagination className="absolute bottom-5 right-[30px] justify-end">
            <PaginationContent className="gap-0">
              <PaginationItem className="text-sm font-normal mr-[10px]">
                {`Page ${pageIndex + 1} of ${pageCount || 1}`}
              </PaginationItem>
              <PaginationItem
                onClick={() => {
                  prevPage(true);
                }}
              >
                <PaginationFirstPage className="h-6 w-6 p-0 grid place-items-center cursor-pointer" />
              </PaginationItem>
              <PaginationItem
                onClick={() => {
                  prevPage();
                }}
              >
                <PaginationPrevious className="h-6 w-6 p-0 grid place-items-center cursor-pointer" />
              </PaginationItem>
              <PaginationItem
                onClick={() => {
                  nextPage();
                }}
              >
                <PaginationNext className="h-6 w-6 p-0 grid place-items-center cursor-pointer" />
              </PaginationItem>
              <PaginationItem
                onClick={() => {
                  nextPage(true);
                }}
              >
                <PaginationLastPage className="h-6 w-6 p-0 grid place-items-center cursor-pointer" />
              </PaginationItem>
              {isLoading ? (
                <PaginationItem className="text-sm font-normal">
                  Loading...
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </section>
  );
});
