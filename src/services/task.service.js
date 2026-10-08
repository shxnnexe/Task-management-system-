import Task from "../models/task.model.js";

export const createTask = ({ title, description = "", createdBy }) =>
  Task.create({ title, description, createdBy });
