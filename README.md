# Task Management System

Backend API for creating, updating, deleting, and viewing projects and tasks.

## Requirements

- Node.js 20 or later
- MongoDB

## Setup

```sh
npm install
```

Create the local environment file from the example, then set `JWT_SECRET` to a
random secret of at least 32 characters:

```powershell
Copy-Item .env.example .env
```

The example URI connects to a local MongoDB server at
`mongodb://127.0.0.1:27017/task-management-system`. Ensure MongoDB is running
before starting the API.

## Development

Start the API and the website in separate terminals from the repository root:

```sh
npm run dev
npm run dev:web
```

The API listens on port 3000. The Vite website runs on port 5173 and proxies
`/api` requests to the API. Open `http://localhost:5173` in a browser.

Register or sign in before creating projects and tasks. Passwords are hashed
before storage, and login returns a signed JWT.

## Task API

- `POST /api/tasks` — create a task (`title`, optional `description`, and
  `createdBy` user ID in the JSON body; optional `projectId` groups it under a
  project).
- `GET /api/tasks` — list tasks, newest first.
- `PUT /api/tasks/:id` — update a task's `title`, `description`, and/or
  `projectId`. Set `projectId` to `null` to remove the task from a project.
- `DELETE /api/tasks/:id` — delete a task.

## Project API

- `POST /api/projects` — create a project (`name`, required `createdBy` user
  ID, and optional `description`).
- `GET /api/projects` — list projects, newest first, including each project's
  related `tasks`.
- `GET /api/projects/:id` — fetch one project with its related `tasks`.
- `PUT` or `PATCH /api/projects/:id` — update the project's `name` and/or
  `description`.
- `DELETE /api/projects/:id` — delete a project that has no tasks. Returns
  `409` while tasks are assigned, to avoid removing their parent project.

Successful responses use `{ "success": true, "data": ... }`. Project responses
include the Mongoose `id` and a `tasks` array. Error responses use
`{ "success": false, "error": { "message": ... } }`; validation errors also
include field-level `details`.
