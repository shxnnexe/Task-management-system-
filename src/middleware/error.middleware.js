export const notFoundHandler = (req, res) =>
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });

export const errorHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let status = 500;
  let message = "Internal server error";
  let details;

  if (error.type === "entity.parse.failed" && error.status === 400) {
    status = 400;
    message = "Invalid JSON request body";
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid resource ID";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = "Resource validation failed";
    details = Object.fromEntries(
      Object.entries(error.errors).map(([field, fieldError]) => [
        field,
        fieldError.message,
      ]),
    );
  } else if (Array.isArray(error.errors) && error.statusCode === 400) {
    status = 400;
    message = error.message;
    details = error.errors;
  } else if (Number.isInteger(error.statusCode) && error.statusCode >= 400) {
    status = error.statusCode;
    message = error.message;
  }

  if (status >= 500) {
    console.error("Unhandled API error:", error);
  }

  return res.status(status).json({
    success: false,
    error: details ? { message, details } : { message },
  });
};
