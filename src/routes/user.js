const router = require("express").Router();

const FeatureFlagClient = require("../utils/featureFlagClient");

router.get("/user", async (req, res, next) => {
  try {

    // Get the userSession from the Context in a stateless manner eg: req.user or ctx.user
    const userSession = {
      ROLE: "Admin",
      EMAIL_ID: "kartik@acme.io",
      USER_NAME: "Kartik",
      USER_ID: "ce1a4f61-8643-495a-8d06-7f835a7f9ab1",
      ORGANIZATION_NAME: "Acme",
    };

    const featureFlag = "enable_integration";

    const flagValue = await FeatureFlagClient.getFlags(
      featureFlag,
      FeatureFlagClient.createCtx(userSession),// Pass the user session to the feature flag management system to check user specific flag state.  
      true
    );

    res.send({
      [featureFlag]: flagValue
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
