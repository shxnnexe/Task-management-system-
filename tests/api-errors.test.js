import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import app from "../src/app.js";

test("unknown routes return a JSON 404 response", async (t) => {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    error: { message: "Route not found: GET /missing" },
  });
});

test("malformed JSON returns a JSON 400 response", async (t) => {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => server.close());

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: { message: "Invalid JSON request body" },
  });
});
