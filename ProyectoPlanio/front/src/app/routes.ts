import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import RoomsList from "./components/RoomsList";
import RoomDashboard from "./components/RoomDashboard";
import { PublicOnly, RequireAuth } from "./components/routing/AuthGuards";

function LoginRoute() {
  return createElement(PublicOnly, null, createElement(Login));
}

function RegisterRoute() {
  return createElement(PublicOnly, null, createElement(Register));
}

function RoomsRoute() {
  return createElement(RequireAuth, null, createElement(RoomsList));
}

function RoomDashboardRoute() {
  return createElement(RequireAuth, null, createElement(RoomDashboard));
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginRoute,
  },
  {
    path: "/rooms",
    Component: RoomsRoute,
  },
  {
    path: "/register",
    Component: RegisterRoute,
  },
  {
    path: "/room/:roomId",
    Component: RoomDashboardRoute,
  },
  {
    path: "*",
    Component: LoginRoute,
  },
]);
