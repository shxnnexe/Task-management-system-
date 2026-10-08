const createAuthController = (authService) => ({
    register: async (req, res, next) => {
        try {
            const user = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: "Registration successful",
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const { user, token } = await authService.login(req.body);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: { user, token }
            });
        } catch (error) {
            next(error);
        }
    }
});

module.exports = { createAuthController };
