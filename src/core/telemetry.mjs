/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const collectTelemetryData = async () => {
    const { platform, version } = globalThis.__enhancerApi,
      { getMods, isEnabled } = globalThis.__enhancerApi,
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      // prettier-ignore
      enabledMods = (await getMods(async (mod) => {
        if (mod._src === "core") return false;
        return await isEnabled(mod.id);
      })).map(mod => mod.id);
    return { platform, version, timezone, enabledMods };
  },
  sendTelemetryPing = async () => {
    const db = globalThis.__enhancerApi.initDatabase(),
      agreedToTerms = await db.get("agreedToTerms"),
      telemetryEnabled = (await db.get("telemetryEnabled")) ?? true;
    if (!telemetryEnabled || agreedToTerms !== version) return;
    // telemetry
    const telemetryData = await collectTelemetryData();
  };

export { collectTelemetryData, sendTelemetryPing };
