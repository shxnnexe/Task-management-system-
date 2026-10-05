import Project from "../models/project.model.js";
import Task from "../models/task.model.js";

export const createProject = async (projectData) => {
  const project = await Project.create(projectData);
  return project.populate("tasks");
};

export const listProjects = () =>
  Project.find().populate("tasks").sort({ createdAt: -1 });

export const getProjectById = (id) => Project.findById(id).populate("tasks");

export const updateProject = (id, updates) =>
  Project.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate("tasks");

export const deleteProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    return null;
  }

  if (await Task.exists({ projectId: id })) {
    const error = new Error("Cannot delete a project that still has tasks");
    error.statusCode = 409;
    throw error;
  }

  return Project.findByIdAndDelete(id);
};
