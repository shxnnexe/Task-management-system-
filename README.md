# Task-management-system-
# Task Management System

A responsive project and task organizer built with React, TypeScript, and Vite.

## Getting started

```sh
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`. Set
`VITE_API_BASE_URL` to override the API base URL in another environment.

## Project API contract

The frontend expects:

- `GET /projects` to return a JSON array of projects.
- `POST /projects` with `{ "name": string, "description": string }` to return the created project.
- Each project to include `id` and `name`; `description` and an array of `tasks` are optional.
- Each task in `tasks` to include `id` and `title`; `description` and `status` are optional.

Responses use direct JSON values (not an additional `{ "data": ... }` envelope).
