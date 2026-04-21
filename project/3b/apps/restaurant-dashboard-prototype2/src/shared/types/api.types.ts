export type ApiListResponse<T> = {
  items: T[];
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export type MutationResult<T> = {
  data: T;
  message?: string;
};
