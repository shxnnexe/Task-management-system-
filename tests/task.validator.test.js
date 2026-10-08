import assert from "node:assert/strict";
import test from "node:test";
import { createTaskSchema, updateTaskSchema } from "../src/validators/task.validator.js";

test("create task requires a non-empty title and valid creator ID", () => {
  const valid = createTaskSchema.safeParse({
    title: "  Write tests  ",
    createdBy: "0123456789abcdef01234567",
  });
  assert.equal(valid.success, true);
  assert.deepEqual(valid.data, {
    title: "Write tests",
    createdBy: "0123456789abcdef01234567",
  });

  assert.equal(
    createTaskSchema.safeParse({ title: " ", createdBy: "not-an-id" }).success,
    false,
  );
});

test("update task accepts editable fields but rejects empty or unknown input", () => {
  assert.deepEqual(updateTaskSchema.parse({ description: "Updated" }), {
    description: "Updated",
  });
  assert.equal(updateTaskSchema.safeParse({}).success, false);
  assert.equal(
    updateTaskSchema.safeParse({ createdBy: "0123456789abcdef01234567" }).success,
    false,
  );
});
