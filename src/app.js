const express = require("express");

const FeatureFlagClient = require("./utils/featureFlagClient");
const userRouter = require("./routes/user");
const roleRouter = require("./routes/user");

const app = express();
const logger = console;
const config = {
    port: 4000,
};

app.use((req, res, next) => {
    logger.info(`uri : ${req.url}`);
    next();
});

app.use("/health-check", (req, res, next) => {
    try {
        res.send(`app is up and running at port ${config.port}`);
    } catch (error) {
        next(error);
    }
});

app.use(userRouter);
app.use(roleRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack to console

    // Respond with status 500 and error message
    res.status(500).send({
        status: 500,
        message: err.message,
        body: {},
    });
});

module.exports = { app, FeatureFlagClient, config, logger };
