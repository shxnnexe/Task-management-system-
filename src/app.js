const express = require("express");
const { createAuthRoutes } = require("./routes/authRoutes");
const { createAuthService } = require("./services/authService");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const createApp = ({ authService = createAuthService() } = {}) => {
    const app = express();

    app.use(express.json());
    app.use("/api", createAuthRoutes(authService));
    app.use(notFound);
    app.use(errorHandler);

    return app;
};

module.exports = { createApp };
