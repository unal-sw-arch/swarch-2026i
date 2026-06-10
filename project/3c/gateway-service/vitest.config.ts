import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Set required env vars before any module is loaded
    env: {
      USER_SERVICE_URL: "http://user-service:4000",
      SCRAPPER_SERVICE_URL: "http://scrapper-service:5000",
    },
  },
});
