const assert = require("node:assert/strict");
const test = require("node:test");
const { createAuthController } = require("../src/controllers/authController");

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

test("registration controller returns a created user", async () => {
    const user = { id: "user-id", username: "sampleuser", role: "user" };
    const controller = createAuthController({
        async register(credentials) {
            assert.deepEqual(credentials, { username: "sampleuser", password: "secret1" });
            return user;
        }
    });
    const res = createResponse();

    await controller.register(
        { body: { username: "sampleuser", password: "secret1" } },
        res,
        assert.fail
    );

    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, {
        success: true,
        message: "Registration successful",
        data: { user }
    });
});

test("login controller forwards service errors to error middleware", async () => {
    const failure = new Error("login failed");
    const controller = createAuthController({
        async login() {
            throw failure;
        }
    });
    let forwardedError;

    await controller.login(
        { body: { username: "sampleuser", password: "secret1" } },
        createResponse(),
        (error) => { forwardedError = error; }
    );

    assert.equal(forwardedError, failure);
});
