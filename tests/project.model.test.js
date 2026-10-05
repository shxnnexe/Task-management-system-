import assert from "node:assert/strict";
import test from "node:test";
import Project from "../src/models/project.model.js";
import Task from "../src/models/task.model.js";

test("project model requires a name and creator and exposes related tasks", () => {
  const project = new Project({ createdBy: "0123456789abcdef01234567" });
  const validationError = project.validateSync();

  assert.equal(validationError.errors.name.kind, "required");
  assert.equal(validationError.errors.createdBy, undefined);
  assert.equal(Project.schema.virtuals.tasks.options.ref, "Task");
  assert.equal(Project.schema.virtuals.tasks.options.foreignField, "projectId");
  assert.equal(Task.schema.path("projectId").options.ref, "Project");
});
