export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const ok = <T>(data: T, message?: string): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message !== undefined) {
    response.message = message;
  }
  return response;
};

export const fail = (message: string): ApiResponse<null> => ({
  success: false,
  message,
});

