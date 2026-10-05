import type { AuthUser, Project, Task } from "./types";

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

function unwrapResponse(value: unknown): unknown {
  if (!isRecord(value) || value.success !== true || !("data" in value)) {
    throw new ApiError("The server returned an invalid response.");
  }
  return value.data;
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

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("The server returned an invalid JSON response.", response.status);
  }

  if (!response.ok) {
    const message =
      isRecord(body) &&
      isRecord(body.error) &&
      typeof body.error.message === "string"
        ? body.error.message
        : `The server returned an error (${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return unwrapResponse(body);
}

function parseAuthUser(value: unknown): AuthUser | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.username !== "string" ||
    typeof value.role !== "string"
  ) {
    return null;
  }
  return { id: value.id, username: value.username, role: value.role };
}

function parseTask(value: unknown): Task | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string"
  ) {
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
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string"
  ) {
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

export async function registerUser(username: string, password: string): Promise<AuthUser> {
  const result = await request("/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const user = isRecord(result) ? parseAuthUser(result.user) : null;
  if (!user) throw new ApiError("The server returned an invalid user response.");
  return user;
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const result = await request("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const user = isRecord(result) ? parseAuthUser(result.user) : null;
  if (!user || !isRecord(result) || typeof result.token !== "string") {
    throw new ApiError("The server returned an invalid login response.");
  }
  return { user, token: result.token };
}

export async function getProjects(signal?: AbortSignal): Promise<Project[]> {
  return parseProjectList(await request("/projects", { signal }));
}

export async function postProject(
  input: Pick<Project, "name" | "description"> & { createdBy: string },
): Promise<Project> {
  return parseProjectResponse(
    await request("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );
}

export async function postTask(input: {
  title: string;
  description: string;
  createdBy: string;
  projectId: string;
}): Promise<Task> {
  const result = await request("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const task = parseTask(result);
  if (!task) throw new ApiError("The server returned an invalid task response.");
  return task;
}
