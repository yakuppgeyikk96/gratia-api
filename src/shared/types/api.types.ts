export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

export interface IApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  errorCode?: string;
  timestamp?: string;
}

export interface IApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  timestamp?: string;
}
