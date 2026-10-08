const assert = require("node:assert/strict");
const test = require("node:test");
const AppError = require("../src/utils/AppError");
const { createAuthService } = require("../src/services/authService");

test("registers a user with a password hash and returns only public fields", async () => {
    let createdUser;
    const service = createAuthService({
        UserModel: {
            async create(user) {
                createdUser = user;
                return {
                    _id: { toString: () => "user-id" },
                    username: user.username,
                    role: "user",
                    password: user.password
                };
            }
        },
        async hashPassword(password) {
            return `hashed:${password}`;
        }
    });

    const user = await service.register({ username: "newuser", password: "secret1" });

    assert.deepEqual(createdUser, { username: "newuser", password: "hashed:secret1" });
    assert.deepEqual(user, { id: "user-id", username: "newuser", role: "user" });
});

test("translates duplicate usernames to a conflict error", async () => {
    const service = createAuthService({
        UserModel: {
            async create() {
                throw { code: 11000 };
            }
        },
        async hashPassword(password) {
            return password;
        }
    });

    await assert.rejects(
        service.register({ username: "existing", password: "secret1" }),
        (error) => error instanceof AppError && error.statusCode === 409
    );
});
