// docs/05-API-CONTRACTS.md §1. Expected failures are returned, never thrown.

export type ErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "ALREADY_TAKEN"
  | "NOT_FOUND"
  | "RETRY";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; code: ErrorCode };
