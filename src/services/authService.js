const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const publicUser = (user) => ({
    id: user.id || user._id.toString(),
    username: user.username,
    role: user.role
});

const createAuthService = ({
    UserModel = User,
    hashPassword = (password) => bcrypt.hash(password, 12)
} = {}) => ({
    async register({ username, password }) {
        const passwordHash = await hashPassword(password);

        try {
            const user = await UserModel.create({
                username,
                password: passwordHash
            });
            return publicUser(user);
        } catch (error) {
            if (error.code === 11000) {
                throw new AppError("Username is already registered", 409);
            }
            throw error;
        }
    }
});

module.exports = { createAuthService };
