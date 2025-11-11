import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      status,
      message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  // Send error response
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Helper function to create custom errors
export class CustomError extends Error implements AppError {
  status: number;
  isOperational: boolean;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error classes
export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation Error') {
    super(message, 422);
  }
}
