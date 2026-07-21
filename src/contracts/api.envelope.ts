/**
 * TeslaPrimeCapital — Standardized API Request & Response Envelopes
 * Every single REST endpoint must wrap its output inside IApiResponse<T> without exception.
 */

export interface IPaginationMeta {
  cursor?: string | null;
  page?: number;
  limit?: number;
  totalCount?: number;
  hasNextPage?: boolean;
}

export interface IApiErrorDetail {
  field: string;
  issue: string;
}

export interface IApiError {
  code: string;
  message: string;
  details?: IApiErrorDetail[];
}

export interface IApiResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: IPaginationMeta;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  meta: IApiResponseMeta;
}
