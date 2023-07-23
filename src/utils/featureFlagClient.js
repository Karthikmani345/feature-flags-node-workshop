const LaunchDarkly = require("@launchdarkly/node-server-sdk");

class FeatureFlagClient {
  static launchDarklyClient;
  static MAX_RETRIES = 5;
  static RETRY_DELAY_MS = 5000;
  static retryCount = 0;
  static enableMockServer = false;

  static init(sdkKey, enableMockServer = false) {
    this.enableMockServer = enableMockServer;
    // Skip LaunchDarkly initialization in non Prod environment using Mock Server.
    if (this.enableMockServer) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.launchDarklyClient = LaunchDarkly.init(sdkKey);

      this.launchDarklyClient.on("failed", (err) => {
        console.error("Connection to LaunchDarkly server failed.", err?.message);
        if (this.retryCount < this.MAX_RETRIES) {
          console.log(`Retry attempt #${this.retryCount + 1}`);
          this.retryCount++;
          setTimeout(() => {
            this.init(sdkKey).then(resolve).catch(reject);
          }, this.RETRY_DELAY_MS);
        } else {
          reject("Failed to connect to LaunchDarkly server.");
        }
      });

      this.launchDarklyClient.once("ready", () => {
        this.retryCount = 0;
        console.error("Connected to LaunchDarkly server.");
        resolve();
      });

      this.launchDarklyClient.on("shutdown", (args) => {
        console.log("Disconnected from LaunchDarkly server.", args);
        if (this.retryCount < this.MAX_RETRIES) {
          console.log(`Reconnecting attempt #${this.retryCount + 1}`);
          this.retryCount++;
          setTimeout(() => {
            this.init(sdkKey)
              .then(resolve)
              .catch((err) => {
                console.log("Failed to reconnect to LaunchDarkly server.", err);
              });
          }, this.RETRY_DELAY_MS);
        } else {
          console.log("Failed to reconnect to LaunchDarkly server.");
        }
      });
    });
  }

  static async getFlags(featureKey, ctx, defaultValue) {
    // Return default value in non prod environment or if not initialized
    if (this.enableMockServer || !this.isInitialized()) {
      return Promise.resolve(defaultValue);
    }
    return await this.launchDarklyClient.variation(
      featureKey,
      ctx,
      defaultValue
    );
  }

  static async getAllFlagsState(ctx) {
    // Return empty object in non prod environment or if not initialized
    if (this.enableMockServer || !this.isInitialized()) {
      return Promise.resolve({});
    }
    return (await this.launchDarklyClient.allFlagsState(ctx)).allValues();
  }

  static isInitialized() {
    return this.launchDarklyClient && this.launchDarklyClient.initialized();
  }

  static createCtx(args, kind = "session", key = "session-detail") {
    return { kind, key, ...args };
  }
}

module.exports = FeatureFlagClient;
