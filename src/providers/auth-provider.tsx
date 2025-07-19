import { Fragment } from "react";
import useStore from "@/store";
import { Navigate, useLocation, Outlet } from "react-router-dom";

export function AuthProvider() {
  const { admin, token } = useStore();
  const location = useLocation();

  let to = "";
  if (!admin || !token) to = "/login";
  else if (location.pathname === "/login") to = "/events";

  return (
    <Fragment>
      <Outlet />
      {to ? <Navigate to={to} /> : null}
    </Fragment>
  );
}
