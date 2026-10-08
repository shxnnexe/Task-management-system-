import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/database.js";

const port = Number(process.env.PORT) || 3000;

try {
  await connectToDatabase(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.info(`Task API listening on port ${port}`);
  });
} catch (error) {
  console.error("Failed to start the Task API:", error);
  process.exitCode = 1;
}
