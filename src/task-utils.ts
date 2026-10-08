export type TaskFilter = "all" | "todo" | "in-progress" | "completed";

export function normalizedStatus(status?: string): Exclude<TaskFilter, "all"> {
  const value = status?.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (value === "done" || value === "complete" || value === "completed") return "completed";
  if (value === "in-progress" || value === "inprogress") return "in-progress";
  return "todo";
}
