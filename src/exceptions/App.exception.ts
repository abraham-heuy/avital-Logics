export class AppException extends Error {
    public readonly statusCode: number;
    public readonly code: string;
  
    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      Error.captureStackTrace(this, this.constructor);
    }
  }