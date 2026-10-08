require("dotenv").config();

const mongoose = require("mongoose");
const { createApp } = require("./app");

const startServer = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be configured");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const port = Number(process.env.PORT) || 5000;
    const app = createApp();
    app.listen(port, () => {
        console.log(`API server listening on port ${port}`);
    });
};

startServer().catch((error) => {
    console.error("Unable to start API server:", error.message);
    process.exitCode = 1;
});
