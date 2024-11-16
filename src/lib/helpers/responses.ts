export interface APIResponse {
  success: boolean;
  data?: any;
  errors?: string[] | string;
  message?: string;
}
