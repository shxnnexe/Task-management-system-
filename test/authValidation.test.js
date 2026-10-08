const assert = require("node:assert/strict");
const test = require("node:test");
const { validateCredentials } = require("../src/middleware/validateAuth");

const runValidation = (body) => {
    const req = { body };
    let nextError;
    let nextCalled = false;

    validateCredentials(req, {}, (error) => {
        nextCalled = true;
        nextError = error;
    });

    return { req, nextCalled, nextError };
};

test("requires a non-empty username and a six-character password", () => {
    const { nextError } = runValidation({ username: "  ", password: "12345" });

    assert.equal(nextError.statusCode, 400);
    assert.deepEqual(nextError.errors, [
        "username is required",
        "password must be at least 6 characters"
    ]);
});

test("normalizes usernames and forwards valid credentials", () => {
    const { req, nextCalled, nextError } = runValidation({
        username: "  SampleUser ",
        password: "secret1",
        role: "admin"
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, undefined);
    assert.deepEqual(req.body, { username: "sampleuser", password: "secret1" });
});

test("rejects passwords bcrypt would truncate", () => {
    const { nextError } = runValidation({
        username: "sampleuser",
        password: "é".repeat(37)
    });

    assert.deepEqual(nextError.errors, ["password must not exceed 72 UTF-8 bytes"]);
});
