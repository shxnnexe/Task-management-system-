import { FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError, getProjects, postProject } from "./api";
import type { Project } from "./types";

type TaskFilter = "all" | "todo" | "in-progress" | "completed";

function normalizedStatus(status?: string): Exclude<TaskFilter, "all"> {
  const value = status?.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (value === "done" || value === "complete" || value === "completed") return "completed";
  if (value === "in-progress" || value === "inprogress") return "in-progress";
  return "todo";
}

export default function App() {
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
            <button className="primary-button" type="submit" disabled={isSaving}>
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
