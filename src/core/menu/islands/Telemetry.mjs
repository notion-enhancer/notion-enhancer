/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { useState, setState } from "../state.mjs";
import { Option } from "./Options.mjs";

const privacyPolicy = "https://notion-enhancer.github.io/about/privacy-policy/";
function Telemetry() {
  const { html, platform, version, getMods } = globalThis.__enhancerApi,
    { getProfile, isEnabled, initDatabase } = globalThis.__enhancerApi,
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const $enabledMods = html`<code></code>`;
  useState(["rerender"], async () => {
    let enabledMods = [];
    for (const mod of await getMods()) {
      if (mod._src === "core") continue;
      if (await isEnabled(mod.id)) enabledMods.push(mod.id);
    }
    $enabledMods.innerText = JSON.stringify(enabledMods);
  });

  const _get = async () => {
      // defaults to true, must be explicitly set to false to disable
      return initDatabase().get("telemetryEnabled") ?? true;
    },
    _set = async (value) => {
      await initDatabase().set("telemetryEnabled", value);
      setState({ rerender: true, databaseUpdated: true });
    };

  // todo: actually collect telemetry
  return html`<${Option}
    type="toggle"
    label="Telemetry"
    description=${html`If telemetry is enabled, usage data will be collected
      once a week from your device in order to better understand how and where
      the notion-enhancer is used. This data is anonymous and includes only your
      platform (<code>"${platform}"</code>), timezone
      (<code>"${timezone}"</code>), notion-enhancer version
      (<code>"${version}"</code>), and enabled mods (${$enabledMods}). You can
      opt in or out of telemetry at any time. This setting syncs across
      configuration profiles. For more information, read the notion-enhancer's
      <a href=${privacyPolicy}>privacy policy</a>.`}
    ...${{ _get, _set }}
  />`;
}

export { Telemetry };
