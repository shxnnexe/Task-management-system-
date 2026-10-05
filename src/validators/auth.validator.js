import { z } from "zod";
import { validateBody } from "./validate-body.js";

export const credentialsSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required").max(50),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
        message: "Password must not exceed 72 UTF-8 bytes",
      }),
  })
  .strict()
  .transform(({ username, password }) => ({
    username: username.toLowerCase(),
    password,
  }));

export const validateCredentials = validateBody(credentialsSchema);
