import Task from "../models/task.model.js";

export const createTask = ({ title, description = "", createdBy }) =>
  Task.create({ title, description, createdBy });

export const listTasks = () => Task.find().sort({ createdAt: -1 });

export const updateTask = (id, updates) =>
  Task.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

export const deleteTask = (id) => Task.findByIdAndDelete(id);
