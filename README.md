# Task Management System

Backend API for creating, updating, deleting, and viewing projects and tasks.

## Requirements

- Node.js 20 or later
- MongoDB

## Setup

```sh
npm install
```

Create the local environment file from the example and set `MONGODB_URI` to the
MongoDB connection string:

```powershell
Copy-Item .env.example .env
```

The example URI connects to a local MongoDB server at
`mongodb://127.0.0.1:27017/task-management-system`. Ensure MongoDB is running
before starting the API. The task model stores `createdBy` as a required MongoDB
ObjectId reference to a `User` document. Authentication and the user model are
not part of this task feature.

## Development

```sh
npm run dev
```

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
