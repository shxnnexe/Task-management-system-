import assert from "node:assert/strict";
import test from "node:test";
import { credentialsSchema } from "../src/validators/auth.validator.js";

test("authentication credentials require username and a six-character password", () => {
  assert.deepEqual(
    credentialsSchema.parse({ username: "  David  ", password: "secret1" }),
    { username: "david", password: "secret1" },
  );
  assert.equal(credentialsSchema.safeParse({ username: " ", password: "secret1" }).success, false);
  assert.equal(credentialsSchema.safeParse({ username: "david", password: "12345" }).success, false);
  assert.equal(
    credentialsSchema.safeParse({ username: "david", password: "x".repeat(73) }).success,
    false,
  );
});
