import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  listTasksController,
  updateTaskController,
} from "../controllers/task.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../validators/task.validator.js";

const taskRouter = Router();

taskRouter.post("/", validateCreateTask, createTaskController);
taskRouter.get("/", listTasksController);
taskRouter.put("/:id", validateUpdateTask, updateTaskController);
taskRouter.delete("/:id", deleteTaskController);

export default taskRouter;
