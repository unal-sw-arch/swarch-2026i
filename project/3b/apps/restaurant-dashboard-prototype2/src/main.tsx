import React from "react";
import ReactDOM from "react-dom/client";
import { useAuthStore } from "@/app/store/auth.store";
import { QueryProvider } from "@/app/providers/query-provider";
import App from "./App";
import "./index.css";

useAuthStore.getState().hydrate();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
