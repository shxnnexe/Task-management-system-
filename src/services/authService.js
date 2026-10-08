const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const publicUser = (user) => ({
    id: user.id || user._id.toString(),
    username: user.username,
    role: user.role
});

const createAuthService = ({
    UserModel = User,
    hashPassword = (password) => bcrypt.hash(password, 12),
    comparePassword = (password, passwordHash) => bcrypt.compare(password, passwordHash),
    signToken = (payload, secret, options) => jwt.sign(payload, secret, options),
    getJwtSecret = () => process.env.JWT_SECRET
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
    },

    async login({ username, password }) {
        const user = await UserModel.findOne({ username }).select("+password");
        if (!user || !(await comparePassword(password, user.password))) {
            throw new AppError("Invalid username or password", 401);
        }

        const secret = getJwtSecret();
        if (!secret) {
            throw new AppError("Authentication is not configured", 500);
        }

        const token = signToken(
            { sub: user._id.toString(), role: user.role },
            secret,
            { expiresIn: "1d" }
        );

        return { user: publicUser(user), token };
    }
});

module.exports = { createAuthService };
