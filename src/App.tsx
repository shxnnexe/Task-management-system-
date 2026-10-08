import { FormEvent, useState } from "react";
import type { Project } from "./types";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Enter a project name to continue.");
      return;
    }

    setProjects((current) => [
      ...current,
      { id: crypto.randomUUID(), name: trimmedName, description: description.trim() },
    ]);
    setName("");
    setDescription("");
    setFormError("");
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
            <button className="primary-button" type="submit">Create project <span aria-hidden="true">→</span></button>
          </div>
        </form>
      </section>

      {projects.length > 0 && (
        <section className="local-projects" aria-live="polite">
          <h2>Created this session</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <strong>{project.name}</strong>
                {project.description && <span>{project.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer className="app-footer">A little structure goes a long way.</footer>
    </main>
  );
}
