/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { collectTelemetryData } from "../../telemetry.mjs";
import { useState, setState } from "../state.mjs";
import { Option } from "./Options.mjs";

const privacyPolicy = "https://notion-enhancer.github.io/about/privacy-policy/";
function Telemetry() {
  const { html, initDatabase } = globalThis.__enhancerApi,
    _get = async () => {
      // defaults to true, must be explicitly set to false to disable
      return initDatabase().get("telemetryEnabled") ?? true;
    },
    _set = async (value) => {
      await initDatabase().set("telemetryEnabled", value);
      setState({ rerender: true });
    };

  const $ = {
    platform: html`<code></code>`,
    version: html`<code></code>`,
    timezone: html`<code></code>`,
    enabledMods: html`<code></code>`,
  };
  useState(["rerender"], async () => {
    const telemetryData = await collectTelemetryData();
    for (const key in telemetryData) {
      $[key].innerText = JSON.stringify(telemetryData[key]);
    }
  });

  // todo: actually collect telemetry
  return html`<${Option}
    type="toggle"
    label="Telemetry"
    description=${html`If telemetry is enabled, usage data will be collected
      once a week from your device in order to better understand how and where
      the notion-enhancer is used. This data is anonymous and includes only your
      platform (${$.platform}), notion-enhancer version (${$.version}), timezone
      (${$.timezone}), and enabled mods (${$.enabledMods}). You can opt in or
      out of telemetry at any time. This setting syncs across configuration
      profiles. For more information, read the notion-enhancer's
      <a href=${privacyPolicy} class="ml-[3px]">privacy policy</a>.`}
    ...${{ _get, _set }}
  />`;
}

export { Telemetry };
