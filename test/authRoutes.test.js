const assert = require("node:assert/strict");
const test = require("node:test");
const { createApp } = require("../src/app");

const withServer = async (authService, run) => {
    const server = createApp({ authService }).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();

    try {
        await run(`http://127.0.0.1:${address.port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
};

test("POST /api/register validates and forwards credentials", async () => {
    const authService = {
        async register(credentials) {
            assert.deepEqual(credentials, { username: "newuser", password: "secret1" });
            return { id: "user-id", username: "newuser", role: "user" };
        }
    };

    await withServer(authService, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/register`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: " NewUser ", password: "secret1" })
        });

        assert.equal(response.status, 201);
        assert.equal((await response.json()).user.username, "newuser");
    });
});

test("POST /api/login rejects invalid credentials before calling the service", async () => {
    let serviceCalled = false;
    await withServer({
        async login() {
            serviceCalled = true;
        }
    }, async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: "newuser", password: "123" })
        });

        assert.equal(response.status, 400);
        assert.equal(serviceCalled, false);
    });
});
