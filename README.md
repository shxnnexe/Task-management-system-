# Task Management System

Frontend work for the task management system lives in `frontend/` and uses Vite with vanilla JavaScript.

## Run the frontend

Install Node.js (which includes npm), then run:

```powershell
cd frontend
npm install
npm run dev
```

Run the backend API on port `3000` in a second terminal. The Vite server proxies
`/api` requests to it. Open the local URL printed by Vite (normally
`http://localhost:5173`).

Use `npm run build` to create a production build in `frontend/dist/`.

## Frontend tickets

Each ticket has a local branch named with its ticket ID, without the square brackets:

- `FE1-01` Frontend project structure
- `FE1-02` Registration page
- `FE1-03` Login page
- `FE1-04` Authentication API integration
- `FE1-05` Task creation form
- `FE1-06` Task list with edit and delete
- `FE1-07` Task API integration
