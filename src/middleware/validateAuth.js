const AppError = require("../utils/AppError");

const validateCredentials = (req, _res, next) => {
    const { username, password } = req.body || {};
    const errors = [];

    if (typeof username !== "string" || username.trim().length === 0) {
        errors.push("username is required");
    } else if (username.trim().length > 50) {
        errors.push("username must not exceed 50 characters");
    }

    if (typeof password !== "string" || password.length < 6) {
        errors.push("password must be at least 6 characters");
    } else if (Buffer.byteLength(password, "utf8") > 72) {
        errors.push("password must not exceed 72 UTF-8 bytes");
    }

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    req.body = {
        username: username.trim().toLowerCase(),
        password
    };
    next();
};

module.exports = { validateCredentials };
