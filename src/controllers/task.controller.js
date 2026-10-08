import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../services/task.service.js";

export const createTaskController = async (req, res) => {
  const task = await createTask(req.validatedBody);
  return res.status(201).json({ success: true, data: task });
};

export const listTasksController = async (_req, res) => {
  const tasks = await listTasks();
  return res.status(200).json({ success: true, data: tasks });
};

export const updateTaskController = async (req, res) => {
  const task = await updateTask(req.params.id, req.validatedBody);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: "Task not found" },
    });
  }

  return res.status(200).json({ success: true, data: task });
};

export const deleteTaskController = async (req, res) => {
  const task = await deleteTask(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: "Task not found" },
    });
  }

  return res.status(200).json({ success: true, data: task });
};
