const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const AppError = require("../src/utils/AppError");
const { createAuthService } = require("../src/services/authService");

const existingUser = {
    _id: { toString: () => "user-id" },
    username: "sampleuser",
    role: "user",
    password: "password-hash"
};

const createService = (overrides = {}) => {
    const UserModel = {
        findOne() {
            return { select: async () => existingUser };
        }
    };

    return createAuthService({
        UserModel,
        async comparePassword(password, hash) {
            return password === "secret1" && hash === "password-hash";
        },
        signToken(payload, secret, options) {
            return JSON.stringify({ payload, secret, options });
        },
        getJwtSecret: () => "test-secret",
        ...overrides
    });
};

test("authenticates a user and issues a signed token", async () => {
    const result = await createService().login({
        username: "sampleuser",
        password: "secret1"
    });

    assert.deepEqual(result.user, { id: "user-id", username: "sampleuser", role: "user" });
    assert.deepEqual(JSON.parse(result.token), {
        payload: { sub: "user-id", role: "user" },
        secret: "test-secret",
        options: { expiresIn: "1d" }
    });
});

test("rejects invalid credentials without revealing whether the username exists", async () => {
    const service = createService({
        async comparePassword() {
            return false;
        }
    });

    await assert.rejects(
        service.login({ username: "sampleuser", password: "wrong1" }),
        (error) => error instanceof AppError
            && error.statusCode === 401
            && error.message === "Invalid username or password"
    );
});

test("rejects login if the JWT secret is not configured", async () => {
    const service = createService({ getJwtSecret: () => undefined });

    await assert.rejects(
        service.login({ username: "sampleuser", password: "secret1" }),
        (error) => error instanceof AppError && error.statusCode === 500
    );
});

test("issues a verifiable JWT with the user identity and role", async () => {
    const service = createAuthService({
        UserModel: {
            findOne() {
                return { select: async () => existingUser };
            }
        },
        async comparePassword() {
            return true;
        },
        getJwtSecret: () => "test-secret"
    });

    const { token } = await service.login({
        username: "sampleuser",
        password: "secret1"
    });
    const claims = jwt.verify(token, "test-secret");

    assert.equal(claims.sub, "user-id");
    assert.equal(claims.role, "user");
});
