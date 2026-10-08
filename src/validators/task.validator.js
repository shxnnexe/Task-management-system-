import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid user ID");

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    createdBy: objectIdSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .strict()
  .refine((task) => Object.keys(task).length > 0, {
    message: "At least one task field must be provided",
  });

export const validateTaskBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: result.error.flatten().fieldErrors,
      },
    });
  }

  req.validatedBody = result.data;
  return next();
};

export const validateCreateTask = validateTaskBody(createTaskSchema);
export const validateUpdateTask = validateTaskBody(updateTaskSchema);
