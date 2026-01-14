import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError, type ApiError } from '@open-brochure/shared';

/**
 * Global error handler for Fastify
 */
export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Handle AppError (our custom errors)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(error.toJSON());
  }

  // Handle Fastify validation errors
  if ('validation' in error && error.validation) {
    const response: ApiError = {
      error: 'ValidationError',
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: { validation: error.validation },
    };
    return reply.status(400).send(response);
  }

  // Handle generic errors
  const statusCode = 'statusCode' in error ? (error.statusCode as number) : 500;
  const response: ApiError = {
    error: error.name || 'Error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR',
  };

  return reply.status(statusCode).send(response);
}
