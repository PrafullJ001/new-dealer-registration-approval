function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// wraps async controllers so a thrown error reaches the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { httpError, asyncHandler };