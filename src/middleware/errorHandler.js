const AppError = require("../utils/AppError");
const { errorResponse } = require("../utils/apiResponse");

const notFound = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (error, _req, res, _next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message;
    let errors = error.errors;

    if (error.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Invalid JSON body";
        errors = null;
    } else if (error.name === "ValidationError" && error.errors) {
        statusCode = 400;
        message = "Validation failed";
        errors = Object.values(error.errors).map((validationError) => validationError.message);
    } else if (error.code === 11000) {
        statusCode = 409;
        message = "Username is already registered";
        errors = null;
    }

    if (statusCode >= 500) {
        console.error(error);
        message = "Internal server error";
        errors = null;
    }

    res.status(statusCode).json(errorResponse(message, errors));
};

module.exports = { notFound, errorHandler };
