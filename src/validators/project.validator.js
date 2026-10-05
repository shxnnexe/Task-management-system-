import { z } from "zod";
import { validateBody } from "./validate-body.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid user ID");

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(5000).optional(),
    createdBy: objectIdSchema,
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .strict()
  .refine((project) => Object.keys(project).length > 0, {
    message: "At least one project field must be provided",
  });

export const validateCreateProject = validateBody(createProjectSchema);
export const validateUpdateProject = validateBody(updateProjectSchema);
