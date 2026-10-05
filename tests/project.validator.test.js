import assert from "node:assert/strict";
import test from "node:test";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../src/validators/project.validator.js";

const createdBy = "0123456789abcdef01234567";

test("create project requires a non-empty name and creator ID", () => {
  assert.deepEqual(
    createProjectSchema.parse({
      name: "  Website refresh  ",
      createdBy,
    }),
    {
      name: "Website refresh",
      createdBy,
    },
  );
  assert.equal(createProjectSchema.safeParse({ name: " ", createdBy }).success, false);
  assert.equal(createProjectSchema.safeParse({ name: "Project" }).success, false);
  assert.equal(
    createProjectSchema.safeParse({ name: "Project", createdBy: "not-an-id" }).success,
    false,
  );
});

test("update project accepts editable fields but rejects empty or unknown input", () => {
  assert.deepEqual(updateProjectSchema.parse({ description: "Updated" }), {
    description: "Updated",
  });
  assert.equal(updateProjectSchema.safeParse({}).success, false);
  assert.equal(
    updateProjectSchema.safeParse({ createdBy }).success,
    false,
  );
});
