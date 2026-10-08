import { FormEvent, useEffect, useState } from "react";
import { ApiError, getProjects, postProject } from "./api";
import type { Project } from "./types";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProjects(controller.signal)
      .then(setProjects)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setRequestError(error instanceof ApiError ? error.message : "Unable to load projects.");
      });
    return () => controller.abort();
  }, []);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Enter a project name to continue.");
      return;
    }

    setIsSaving(true);
    setRequestError("");
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
      setRequestError(error instanceof ApiError ? error.message : "Unable to create the project.");
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
          {requestError && <p className="request-error" role="alert">{requestError}</p>}
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

      {projects.length > 0 && (
        <section className="project-list" aria-live="polite">
          <div className="list-heading">
            <div>
              <p className="eyebrow">IN YOUR WORKSPACE</p>
              <h2>Your projects <span className="project-total">{projects.length}</span></h2>
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
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
                          <span className={`task-status status-${task.status ?? "todo"}`} aria-hidden="true" />
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
        </section>
      )}
      <footer className="app-footer">A little structure goes a long way.</footer>
    </main>
  );
}
