export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const periodOptions = ["daily", "weekly", "monthly", "yearly"] as const;
export const StatusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
