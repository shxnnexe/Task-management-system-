import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
});

export const registerUser = async ({ username, password }) => {
  try {
    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 12),
    });
    return toPublicUser(user);
  } catch (error) {
    if (error.code === 11000) {
      const conflict = new Error("Username is already registered");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
};

export const authenticateUser = async ({ username, password }) => {
  const user = await User.findOne({ username }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const unauthorized = new Error("Invalid username or password");
    unauthorized.statusCode = 401;
    throw unauthorized;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required for authentication");
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: "1d" },
  );

  return { user: toPublicUser(user), token };
};
