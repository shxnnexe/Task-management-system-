import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";

const app = express();

app.use(express.json());
app.use("/api", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
