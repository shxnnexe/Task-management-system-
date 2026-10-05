import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

const ensureProjectExists = async (projectId) => {
  if (projectId && !(await Project.exists({ _id: projectId }))) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }
};

export const createTask = async ({
  title,
  description = "",
  createdBy,
  projectId,
}) => {
  await ensureProjectExists(projectId);
  return Task.create({ title, description, createdBy, projectId });
};

export const listTasks = () => Task.find().sort({ createdAt: -1 });

export const updateTask = async (id, updates) => {
  await ensureProjectExists(updates.projectId);
  return Task.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

export const deleteTask = (id) => Task.findByIdAndDelete(id);
