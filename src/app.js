import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import taskRouter from "./routes/task.routes.js";

const app = express();

app.use(express.json());
app.use("/api/tasks", taskRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
