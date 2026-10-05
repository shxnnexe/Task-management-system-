import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller.js";
import { validateCredentials } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/register", validateCredentials, registerController);
authRouter.post("/login", validateCredentials, loginController);

export default authRouter;
