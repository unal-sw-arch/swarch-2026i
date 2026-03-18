import { createBrowserRouter } from "react-router";
import Login from "./components/Login";
import RoomsList from "./components/RoomsList";
import RoomDashboard from "./components/RoomDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/rooms",
    Component: RoomsList,
  },
  {
    path: "/room/:roomId",
    Component: RoomDashboard,
  },
  {
    path: "*",
    Component: Login,
  },
]);
