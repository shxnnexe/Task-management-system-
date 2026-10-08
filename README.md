# Task Management System

Backend API for creating, updating, deleting, and viewing tasks.

## Requirements

- Node.js 20 or later
- MongoDB

## Setup

```sh
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI` to the MongoDB connection
string before starting the server. The task model stores `createdBy` as a
required MongoDB ObjectId reference to a `User` document. Authentication and the
user model are not part of this task feature.

## Development

```sh
npm run dev
```

## Task API

- `POST /api/tasks` — create a task (`title`, optional `description`, and
  `createdBy` user ID in the JSON body).
- `GET /api/tasks` — list tasks, newest first.
- `PUT /api/tasks/:id` — update a task's `title` and/or `description`.
- `DELETE /api/tasks/:id` — delete a task.

Successful responses use `{ "success": true, "data": ... }`. Error responses use
`{ "success": false, "error": { "message": ... } }`.
