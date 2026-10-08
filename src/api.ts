import type { Project, Task } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTask(value: unknown): Task | null {
  if (!isRecord(value) || (typeof value.id !== "string" && typeof value.id !== "number") || typeof value.title !== "string") {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    ...(typeof value.description === "string" ? { description: value.description } : {}),
    ...(typeof value.status === "string" ? { status: value.status } : {}),
  };
}

function parseProject(value: unknown): Project | null {
  if (!isRecord(value) || (typeof value.id !== "string" && typeof value.id !== "number") || typeof value.name !== "string") {
    return null;
  }

  let tasks: Task[] | undefined;
  if (value.tasks !== undefined) {
    if (!Array.isArray(value.tasks)) return null;
    const parsedTasks = value.tasks.map(parseTask);
    if (parsedTasks.some((task) => task === null)) return null;
    tasks = parsedTasks.filter((task): task is Task => task !== null);
  }

  return {
    id: value.id,
    name: value.name,
    ...(typeof value.description === "string" ? { description: value.description } : {}),
    ...(tasks ? { tasks } : {}),
  };
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new ApiError(detail.trim() || `The server returned an error (${response.status}).`, response.status);
  }

  return response.json() as Promise<unknown>;
}

function parseProjectList(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    throw new ApiError("The server returned an invalid projects response.");
  }

  const projects = value.map(parseProject);
  if (projects.some((project) => project === null)) {
    throw new ApiError("The server returned a project with missing or invalid fields.");
  }
  return projects.filter((project): project is Project => project !== null);
}

function parseProjectResponse(value: unknown): Project {
  const project = parseProject(value);
  if (!project) throw new ApiError("The server returned an invalid project response.");
  return project;
}

export async function getProjects(signal?: AbortSignal): Promise<Project[]> {
  return parseProjectList(await request("/projects", { signal }));
}

export async function postProject(input: Pick<Project, "name" | "description">): Promise<Project> {
  return parseProjectResponse(await request("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}
