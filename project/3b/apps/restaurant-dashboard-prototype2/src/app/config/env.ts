export type DataSource = "mock" | "api";

export type AppEnv = {
  apiBaseUrl: string;
  dataSource: DataSource;
};

function parseDataSource(value: string | undefined): DataSource {
  return value === "api" ? "api" : "mock";
}

export const ENV: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  dataSource: parseDataSource(import.meta.env.VITE_DATA_SOURCE),
};

export const env = ENV;
