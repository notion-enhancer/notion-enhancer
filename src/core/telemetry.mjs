/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const pingEndpoint = "https://notion-enhancer.deno.dev/api/ping",
  collectTelemetryData = async () => {
    const { platform, version } = globalThis.__enhancerApi,
      { getMods, isEnabled } = globalThis.__enhancerApi,
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      // prettier-ignore
      enabled_mods = (await getMods(async (mod) => {
        if (mod._src === "core") return false;
        return await isEnabled(mod.id);
      })).map(mod => mod.id);
    return { platform, version, timezone, enabled_mods };
  },
  sendTelemetryPing = async () => {
    const db = __enhancerApi.initDatabase(),
      { version } = globalThis.__enhancerApi,
      agreedToTerms = await db.get("agreedToTerms"),
      telemetryEnabled = (await db.get("telemetryEnabled")) ?? true;
    if (!telemetryEnabled || agreedToTerms !== version) return;

    const lastTelemetryPing = await db.get("lastTelemetryPing");
    if (lastTelemetryPing) {
      const msSincePing = Date.now() - new Date(lastTelemetryPing);
      // send ping only once a week
      if (msSincePing / 8.64e7 < 7) return;
    }

    try {
      const telemetryData = await collectTelemetryData(),
        pingTimestamp = await fetch(pingEndpoint, {
          method: "POST",
          body: JSON.stringify(telemetryData),
        }).then((res) => res.text());
      await db.set("lastTelemetryPing", pingTimestamp);
    } catch (err) {
      console.error(err);
    }
  };

export { collectTelemetryData, sendTelemetryPing };
