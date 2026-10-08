# Task Management System

Backend API for creating, updating, deleting, and viewing tasks.

## Requirements

- Node.js 20 or later
- MongoDB

## Setup

```sh
npm install
```

Set `MONGODB_URI` to the MongoDB connection string before starting the server.
The task model stores `createdBy` as a required MongoDB ObjectId reference to a
`User` document. Authentication and the user model are not part of this task
feature.

## Development

```sh
npm run dev
```
