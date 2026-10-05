import { z } from "zod";
import { validateBody } from "./validate-body.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid user ID");

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    createdBy: objectIdSchema,
    projectId: objectIdSchema.optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    projectId: objectIdSchema.optional(),
  })
  .strict()
  .refine((task) => Object.keys(task).length > 0, {
    message: "At least one task field must be provided",
  });

export const validateTaskBody = validateBody;
export const validateCreateTask = validateBody(createTaskSchema);
export const validateUpdateTask = validateBody(updateTaskSchema);
