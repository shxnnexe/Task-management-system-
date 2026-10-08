const successResponse = (message, data) => ({
    success: true,
    message,
    data
});

const errorResponse = (message, errors) => ({
    success: false,
    message,
    ...(errors && { errors })
});

module.exports = { successResponse, errorResponse };
