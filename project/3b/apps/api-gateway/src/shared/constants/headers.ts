export const X_REQUEST_ID_HEADER = 'x-request-id';
export const AUTHORIZATION_HEADER = 'authorization';
export const CONTENT_TYPE_HEADER = 'content-type';
export const ACCEPT_HEADER = 'accept';
export const X_USER_ROLE_HEADER = 'x-user-role';

export const FORWARDED_HEADERS = [
  X_REQUEST_ID_HEADER,
  AUTHORIZATION_HEADER,
  CONTENT_TYPE_HEADER,
  ACCEPT_HEADER,
] as const;

export type ForwardedHeader = (typeof FORWARDED_HEADERS)[number];
