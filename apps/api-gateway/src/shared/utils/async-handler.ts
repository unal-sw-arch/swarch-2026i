export type AsyncRouteHandler<TResponse = unknown> = (
  request: import('express').Request,
  response: import('express').Response,
  next: import('express').NextFunction,
) => Promise<TResponse> | TResponse;

export const asyncHandler = (handler: AsyncRouteHandler): import('express').RequestHandler => {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
};
