import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from "../controllers/project.controller.js";
import {
  validateCreateProject,
  validateUpdateProject,
} from "../validators/project.validator.js";

const projectRouter = Router();

projectRouter.post("/", validateCreateProject, createProjectController);
projectRouter.get("/", listProjectsController);
projectRouter.get("/:id", getProjectController);
projectRouter.put("/:id", validateUpdateProject, updateProjectController);
projectRouter.patch("/:id", validateUpdateProject, updateProjectController);
projectRouter.delete("/:id", deleteProjectController);

export default projectRouter;
