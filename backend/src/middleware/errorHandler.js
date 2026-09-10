import ApiError from '../utils/ApiError.js';
import { sendError } from '../utils/response.js';
import config from '../config/env.js';

export const notFoundHandler = (req, res) =>
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);

// Manejo centralizado: toda respuesta de error sale con el mismo formato.
export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.message, error.details);
  }

  if (error?.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Malformed JSON body');
  }

  if (typeof error?.code === 'string' && error.code.startsWith('SQLITE_CONSTRAINT')) {
    return sendError(res, 409, 'The operation violates a database constraint');
  }

  if (config.env !== 'test') {
    console.error('[unhandled error]', error);
  }
  return sendError(res, 500, 'Internal server error');
};
