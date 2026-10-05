import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "../services/project.service.js";

export const createProjectController = async (req, res) => {
  const project = await createProject(req.validatedBody);
  return res.status(201).json({ success: true, data: project });
};

export const listProjectsController = async (_req, res) => {
  const projects = await listProjects();
  return res.status(200).json({ success: true, data: projects });
};

export const getProjectController = async (req, res) => {
  const project = await getProjectById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { message: "Project not found" },
    });
  }

  return res.status(200).json({ success: true, data: project });
};

export const updateProjectController = async (req, res) => {
  const project = await updateProject(req.params.id, req.validatedBody);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { message: "Project not found" },
    });
  }

  return res.status(200).json({ success: true, data: project });
};

export const deleteProjectController = async (req, res) => {
  const project = await deleteProject(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { message: "Project not found" },
    });
  }

  return res.status(200).json({ success: true, data: project });
};
