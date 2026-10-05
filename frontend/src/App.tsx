import { FormEvent, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { ApiError, deleteTask, getProjects, loginUser, postProject, postTask, registerUser, updateTask } from "./api";
import { normalizedStatus, type TaskFilter } from "./task-utils";
import type { AuthUser, Project } from "./types";

function ProjectsPage({ user }: { user: AuthUser | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [createError, setCreateError] = useState("");
  const [projectsError, setProjectsError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  const refreshProjects = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingProjects(true);
    setProjectsError("");
    try {
      setProjects(await getProjects(signal));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setProjectsError(error instanceof ApiError ? error.message : "Unable to load projects.");
    } finally {
      if (!signal?.aborted) setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshProjects(controller.signal);
    return () => controller.abort();
  }, [refreshProjects]);

  const normalizedQuery = searchTerm.trim().toLocaleLowerCase();
  const filteredProjects = projects.flatMap((project) => {
    const projectMatches = normalizedQuery.length > 0
      && `${project.name} ${project.description ?? ""}`.toLocaleLowerCase().includes(normalizedQuery);
    const matchingTasks = (project.tasks ?? []).filter((task) => {
      const matchesStatus = taskFilter === "all" || normalizedStatus(task.status) === taskFilter;
      const matchesQuery = !normalizedQuery
        || projectMatches
        || `${task.title} ${task.description ?? ""}`.toLocaleLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
    const matchesProject = normalizedQuery ? projectMatches : taskFilter === "all";
    return matchesProject || matchingTasks.length > 0
      ? [{ ...project, tasks: matchingTasks }]
      : [];
  });

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setCreateError("Sign in to create a project.");
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Enter a project name to continue.");
      return;
    }

    setIsSaving(true);
    setCreateError("");
    try {
      const createdProject = await postProject({
        name: trimmedName,
        description: description.trim(),
        createdBy: user.id,
      });
      setProjects((current) => [createdProject, ...current]);
      setName("");
      setDescription("");
      setFormError("");
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.message : "Unable to create the project.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Projects</h1>
        <p className="page-description">Give your tasks a home. Create a project to get started.</p>
      </header>

      <section className="panel create-panel" aria-labelledby="create-heading">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">GET ORGANIZED</p>
            <h2 id="create-heading">Create a project</h2>
          </div>
          <span className="heading-mark" aria-hidden="true">+</span>
        </div>

        <form className="project-form" onSubmit={handleCreateProject} noValidate>
          {createError && <p className="request-error" role="alert">{createError}</p>}
          {!user && <p className="helper-text">Please <Link to="/login">sign in</Link> to create a project.</p>}
          <label htmlFor="project-name">Project name <span aria-hidden="true">*</span></label>
          <input
            id="project-name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Website redesign"
            maxLength={80}
            aria-describedby={formError ? "project-name-error" : undefined}
            aria-invalid={Boolean(formError)}
          />
          {formError && <p className="field-error" id="project-name-error">{formError}</p>}

          <label htmlFor="project-description">Description <span className="optional">(optional)</span></label>
          <textarea
            id="project-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you working on?"
            rows={3}
            maxLength={240}
          />
          <div className="form-footer">
            <span className="helper-text">Keep related tasks together.</span>
            <button className="primary-button" type="submit" disabled={isSaving || !user}>
              {isSaving ? "Creating..." : "Create project"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>

      <section className="project-list" aria-live="polite" aria-busy={isLoadingProjects}>
        <div className="list-heading">
          <div>
            <p className="eyebrow">IN YOUR WORKSPACE</p>
            <h2>Your projects <span className="project-total">{projects.length}</span></h2>
          </div>
        </div>
        {isLoadingProjects ? (
          <div className="state-card loading-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Loading your projects...</span>
          </div>
        ) : projectsError ? (
          <div className="state-card error-state" role="alert">
            <div>
              <h3>Projects couldn’t be loaded</h3>
              <p>{projectsError}</p>
            </div>
            <button className="secondary-button" type="button" onClick={() => void refreshProjects()}>
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="state-card empty-state">
            <span className="empty-icon" aria-hidden="true">✳</span>
            <h3>No projects yet</h3>
            <p>Create your first project above to start organizing your tasks.</p>
          </div>
        ) : (
          <>
          <div className="project-filters">
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects or tasks"
                aria-label="Search projects or tasks"
              />
            </label>
            <label className="filter-field">
              <span className="visually-hidden">Filter tasks by status</span>
              <select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value as TaskFilter)}>
                <option value="all">All task statuses</option>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          {filteredProjects.length === 0 ? (
            <div className="state-card filter-empty">
              <h3>No matching results</h3>
              <p>Try another search term or task status.</p>
            </div>
          ) : (
            <div className="project-grid">
              {filteredProjects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-card-top">
                    <span className="project-icon" aria-hidden="true">{project.name.charAt(0).toUpperCase()}</span>
                    <span className="task-count">{project.tasks?.length ?? 0} tasks</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p className="project-description">{project.description || "No description added."}</p>
                  <div className="project-tasks">
                    <h4>Tasks</h4>
                    {project.tasks && project.tasks.length > 0 ? (
                      <ul>
                        {project.tasks.map((task) => (
                          <li key={task.id}>
                            <span className={`task-status status-${normalizedStatus(task.status)}`} aria-hidden="true" />
                            <span>{task.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-tasks">No tasks in this project yet.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          </>
        )}
      </section>
      <footer className="app-footer">A little structure goes a long way.</footer>
    </main>
  );
}

function Navigation({
  user,
  onSignOut,
}: {
  user: AuthUser | null;
  onSignOut: () => void;
}) {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="site-nav-inner">
        <Link className="brand" to="/projects" aria-label="Taskflow home">
          <span className="brand-mark" aria-hidden="true">t</span>
          <span>taskflow</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-user">{user.username}</span>
              <button className="nav-link nav-button" type="button" onClick={onSignOut}>Sign out</button>
            </>
          ) : (
            <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/login">Login</NavLink>
          )}
          <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/tasks">Tasks</NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/projects">Projects</NavLink>
        </div>
      </div>
    </nav>
  );
}

function TasksPage({ user }: { user: AuthUser | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const refreshProjects = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      setProjects(await getProjects(signal));
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") return;
      setError(requestError instanceof ApiError ? requestError.message : "Unable to load tasks.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshProjects(controller.signal);
    return () => controller.abort();
  }, [refreshProjects]);

  const tasks = projects.flatMap((project) =>
    (project.tasks ?? []).map((task) => ({ ...task, projectId: project.id, projectName: project.name })),
  );

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setCreateError("Sign in to create a task.");
      return;
    }
    if (!projectId) {
      setCreateError("Create or select a project first.");
      return;
    }

    setIsSaving(true);
    setCreateError("");
    try {
      await postTask({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.id,
        projectId,
      });
      setTitle("");
      setDescription("");
      await refreshProjects();
    } catch (requestError) {
      setCreateError(requestError instanceof ApiError ? requestError.message : "Unable to create the task.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditTask(task: { id: string; title: string; description?: string }) {
    const titleInput = window.prompt("Update task title", task.title);
    if (titleInput === null) return;
    const title = titleInput.trim();
    if (!title) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      await updateTask(task.id, { title });
      await refreshProjects();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Unable to update the task.");
    }
  }

  async function handleDeleteTask(task: { id: string; title: string }) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      await deleteTask(task.id);
      await refreshProjects();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Unable to delete the task.");
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Tasks</h1>
        <p className="page-description">A clear view of the work inside your projects.</p>
      </header>
      <section className="panel create-panel" aria-labelledby="create-task-heading">
        <div className="panel-heading">
          <div><p className="eyebrow">GET THINGS DONE</p><h2 id="create-task-heading">Create a task</h2></div>
          <span className="heading-mark" aria-hidden="true">+</span>
        </div>
        <form className="project-form" onSubmit={handleCreateTask} noValidate>
          {createError && <p className="request-error" role="alert">{createError}</p>}
          {!user && <p className="helper-text">Please <Link to="/login">sign in</Link> to create a task.</p>}
          <label htmlFor="task-title">Task title <span aria-hidden="true">*</span></label>
          <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
          <label htmlFor="task-description">Description <span className="optional">(optional)</span></label>
          <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} maxLength={5000} />
          <label htmlFor="task-project">Project <span aria-hidden="true">*</span></label>
          <select id="task-project" value={projectId} onChange={(event) => setProjectId(event.target.value)} required>
            <option value="">Select a project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <div className="form-footer">
            <span className="helper-text">{projects.length === 0 ? "Create a project before adding tasks." : "Tasks are grouped under a project."}</span>
            <button className="primary-button" type="submit" disabled={isSaving || !user || projects.length === 0}>
              {isSaving ? "Creating..." : "Create task"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </section>
      <section className="task-page-list" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <div className="state-card loading-state" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Loading your tasks...</span>
          </div>
        ) : error ? (
          <div className="state-card error-state" role="alert">
            <div><h3>Tasks couldn’t be loaded</h3><p>{error}</p></div>
            <button className="secondary-button" type="button" onClick={() => void refreshProjects()}>Try again</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="state-card empty-state">
            <span className="empty-icon" aria-hidden="true">✓</span>
            <h3>No tasks yet</h3>
            <p>Tasks added to your projects will show up here.</p>
            <Link className="text-link" to="/projects">Browse projects</Link>
          </div>
        ) : (
          <ul className="task-page-grid">
            {tasks.map((task) => (
              <li className="task-page-card" key={`${task.projectId}-${task.id}`}>
                <span className={`task-status status-${normalizedStatus(task.status)}`} aria-hidden="true" />
                <div className="task-page-content">
                  <strong>{task.title}</strong>
                  <span>{task.projectName}</span>
                  {task.description && <p>{task.description}</p>}
                </div>
                <span className={`task-status-label task-label-${normalizedStatus(task.status)}`}>
                  {normalizedStatus(task.status).replace("-", " ")}
                </span>
                {user && (
                  <div className="task-actions">
                    <button className="secondary-button" type="button" onClick={() => void handleEditTask(task)}>Edit</button>
                    <button className="secondary-button task-delete-button" type="button" onClick={() => void handleDeleteTask(task)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="app-footer">A little structure goes a long way.</footer>
    </main>
  );
}

function LoginPage({ onAuthenticated }: {
  onAuthenticated: (user: AuthUser, token: string) => void;
}) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await registerUser(username, password);
      }
      const session = await loginUser(username, password);
      onAuthenticated(session.user, session.token);
      navigate("/projects");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="page-description">{mode === "login" ? "Sign in to organize your work." : "Register to start organizing projects and tasks."}</p>
      </header>
      <section className="panel login-panel">
        <form className="project-form" onSubmit={handleSubmit}>
          {error && <p className="request-error" role="alert">{error}</p>}
          <label htmlFor="auth-username">Username</label>
          <input id="auth-username" value={username} onChange={(event) => setUsername(event.target.value)} minLength={1} maxLength={50} autoComplete="username" required />
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
        <p>
          {mode === "login" ? "New here? " : "Already registered? "}
          <button className="text-link text-button" type="button" onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState<{ user: AuthUser; token: string } | null>(() => {
    const stored = sessionStorage.getItem("taskflow-session");
    if (!stored) return null;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "user" in parsed &&
        "token" in parsed &&
        typeof parsed.token === "string" &&
        typeof parsed.user === "object" &&
        parsed.user !== null &&
        "id" in parsed.user &&
        "username" in parsed.user &&
        "role" in parsed.user &&
        typeof parsed.user.id === "string" &&
        typeof parsed.user.username === "string" &&
        typeof parsed.user.role === "string"
      ) {
        return { user: parsed.user as AuthUser, token: parsed.token };
      }
      sessionStorage.removeItem("taskflow-session");
    } catch {
      sessionStorage.removeItem("taskflow-session");
    }
    return null;
  });

  function handleAuthenticated(user: AuthUser, token: string) {
    const nextSession = { user, token };
    sessionStorage.setItem("taskflow-session", JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function handleSignOut() {
    sessionStorage.removeItem("taskflow-session");
    setSession(null);
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navigation user={session?.user ?? null} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage user={session?.user ?? null} />} />
          <Route path="/tasks" element={<TasksPage user={session?.user ?? null} />} />
          <Route path="/login" element={<LoginPage onAuthenticated={handleAuthenticated} />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
