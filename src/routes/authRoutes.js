const express = require("express");
const { createAuthController } = require("../controllers/authController");
const { validateCredentials } = require("../middleware/validateAuth");

const createAuthRoutes = (authService) => {
    const router = express.Router();
    const controller = createAuthController(authService);

    router.post("/register", validateCredentials, controller.register);
    router.post("/login", validateCredentials, controller.login);

    return router;
};

module.exports = { createAuthRoutes };
