export async function enable_integration(userSession) {
  return FeatureFlagClient.getFlags(
    "enable_integration",
    FeatureFlagClient.createCtx(userSession),
    true
  );
}
