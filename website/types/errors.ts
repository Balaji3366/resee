export type AppErrorCode =
  "unauthorized" | "forbidden" | "bad_request" | "not_found" | "rate_limited" | "internal_error";

export interface AppErrorShape {
  code: AppErrorCode;
  message: string;
}

// Matches the existing convention across app/api/**: success responses
// spread arbitrary top-level fields (not a wrapped `data` property), e.g.
// { success: true, categories, courses }.
export type ApiSuccess<T extends object = object> = { success: true } & T;

export interface ApiFailure {
  success: false;
  message: string;
}

export type ApiResult<T extends object = object> = ApiSuccess<T> | ApiFailure;
