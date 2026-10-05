import "../models/task.model.js";
import Project from "../models/project.model.js";

export const createProject = async (projectData) => {
  const project = await Project.create(projectData);
  return project.populate("tasks");
};
