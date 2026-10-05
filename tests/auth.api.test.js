import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import app from "../src/app.js";

test("registration returns JSON validation errors for invalid credentials", async (t) => {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "demo", password: "123" }),
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.error.message, "Validation failed");
  assert.ok(body.error.details.password);
});
