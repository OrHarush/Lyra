export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static gone(message = 'Gone') {
    return new ApiError(410, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, false);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static serviceUnavailable(message = 'Service unavailable') {
    return new ApiError(503, message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }
}
