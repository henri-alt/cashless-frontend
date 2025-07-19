import { AdminSlice } from "./adminSlice";
import { TokenSlice } from "./tokenSlice";
import { FilterSlice } from "./filterSlice";
import { PaginationSlice } from "./paginationSlice";

export type Store = AdminSlice & TokenSlice & FilterSlice & PaginationSlice;

export { adminSlice } from "./adminSlice";
export { tokenSlice } from "./tokenSlice";
export { filterSlice } from "./filterSlice";
export { paginationSlice } from "./paginationSlice";
