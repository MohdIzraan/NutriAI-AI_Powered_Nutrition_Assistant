// Consistent API response helpers
 
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendCreated = (res, data = {}, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const body = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return res.status(statusCode).json(body);
};

const sendValidationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString(),
  });
};

const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404, 'NOT_FOUND');
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401, 'UNAUTHORIZED');
};

const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403, 'FORBIDDEN');
};

const sendConflict = (res, message = 'Conflict') => {
  return sendError(res, message, 409, 'CONFLICT');
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
};
