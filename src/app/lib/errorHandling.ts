export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  if (typeof error === 'string') {
    return new ApiError(error);
  }

  return new ApiError('An unexpected error occurred');
}

export function getErrorMessage(error: ApiError): string {
  // Handle specific error codes
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your internet connection.';
    case 'TIMEOUT':
      return 'Request timed out. Please try again.';
    case 'UNAUTHORIZED':
      return 'You are not authorized to access this resource.';
    case 'FORBIDDEN':
      return 'Access denied. You do not have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again.';
    case 'SERVER_ERROR':
      return 'Server error occurred. Please try again later.';
    default:
      break;
  }

  // Handle HTTP status codes
  switch (error.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timed out. Please try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error occurred. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === 'NETWORK_ERROR' || error.status === 0;
  }
  
  if (error instanceof Error) {
    return error.message.includes('Network Error') || 
           error.message.includes('fetch') ||
           error.message.includes('Failed to fetch');
  }
  
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === 'TIMEOUT' || error.status === 408;
  }
  
  if (error instanceof Error) {
    return error.message.includes('timeout') || 
           error.message.includes('TIMEOUT');
  }
  
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }
  
  return false;
}

export function createApiError(message: string, status?: number, code?: string): ApiError {
  return new ApiError(message, status, code);
} 