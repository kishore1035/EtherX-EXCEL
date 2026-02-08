export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // TODO: Consider adding structured error logging here (e.g., Sentry integration)
  // for better error tracking in production

  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err.message.includes('UNIQUE constraint failed')) {
    return res.status(400).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE',
    });
  }

  if (err.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
      error: 'Invalid reference',
      code: 'INVALID_REFERENCE',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
