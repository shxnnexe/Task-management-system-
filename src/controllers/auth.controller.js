import {
  authenticateUser,
  registerUser,
} from "../services/auth.service.js";

export const registerController = async (req, res) => {
  const user = await registerUser(req.validatedBody);
  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user },
  });
};

export const loginController = async (req, res) => {
  const result = await authenticateUser(req.validatedBody);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};
