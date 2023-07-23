require('dotenv').config();

const { app, FeatureFlagClient, config, logger } = require('./app');

FeatureFlagClient.init(process.env.LAUNCH_DARKLY_SDK_KEY, false)
    .then(() => {
        app.listen(config.port, () => {
            logger.info(`app listening in port ${config.port}`);
        });
    })
    .catch((error) => {
        logger.error("Failed to initialize LaunchDarkly client:", error);
    });
