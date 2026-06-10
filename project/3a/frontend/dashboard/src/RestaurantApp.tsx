import { RouterProvider } from "react-router"
import { appRouter } from "./app.router"

export const RestaurantApp = () => {
  return (
    <RouterProvider router={ appRouter }/>
  )
}
