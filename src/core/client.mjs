/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { checkForUpdate } from "./update.mjs";
import { Frame, Modal, Button } from "./components.mjs";

// prettier-ignore
const asyncFilter = async (arr, predicate) => Promise.all(arr.map(predicate))
  .then((results) => arr.filter((_v, index) => results[index]));

const doThemeOverride = async (db) => {
    const { getMods, isEnabled } = globalThis.__enhancerApi,
      enabledFilter = (theme) => isEnabled(theme.id),
      overrideThemes = await db.get("loadThemeOverrides"),
      enabledThemes = await asyncFilter(await getMods("themes"), enabledFilter);
    return (
      overrideThemes === "Enabled" ||
      (overrideThemes === "Auto" && enabledThemes.length)
    );
  },
  overrideThemes = async (db) => {
    const { html, enhancerUrl } = globalThis.__enhancerApi;
    if (!(await doThemeOverride(db))) return;
    document.head.append(html`<link
      rel="stylesheet"
      href=${enhancerUrl("core/theme.css")}
    />`);
  },
  insertCustomStyles = async (db) => {
    const { html } = globalThis.__enhancerApi,
      customStyles = (await db.get("customStyles"))?.content;
    if (!customStyles) return;
    return document.head.append(html`<style>
      ${customStyles}
    </style>`);
  };

const insertMenu = async (db) => {
    const notionSidebar = `.notion-sidebar-container .notion-sidebar > :nth-child(3) > div > :nth-child(2)`,
      { html, addKeyListener, addMutationListener } = globalThis.__enhancerApi,
      { platform, enhancerUrl, onMessage } = globalThis.__enhancerApi,
      menuButtonIconStyle = await db.get("menuButtonIconStyle"),
      openMenuHotkey = await db.get("openMenuHotkey"),
      renderPing = {
        namespace: "notion-enhancer",
        hotkey: openMenuHotkey,
        icon: menuButtonIconStyle,
      };

    let _contentWindow;
    const sendThemePing = () => {
        const darkMode = document.body.classList.contains("dark"),
          notionTheme = darkMode ? "dark" : "light";
        if (renderPing.theme === notionTheme) return;
        renderPing.theme = notionTheme;
        _contentWindow?.postMessage?.(renderPing, "*");
      },
      sendRenderPing = (contentWindow) => {
        _contentWindow ??= contentWindow;
        if (!$modal.hasAttribute("open")) return;
        delete renderPing.theme;
        _contentWindow?.focus?.();
        sendThemePing();
      };

    const $modal = html`<${Modal} onopen=${sendRenderPing}>
        <${Frame}
          title="notion-enhancer menu"
          src="${enhancerUrl("core/menu/index.html")}"
          onload=${function () {
            // pass notion-enhancer api to electron menu process
            if (platform !== "browser") {
              const apiKey = "__enhancerApi";
              this.contentWindow[apiKey] = globalThis[apiKey];
            }
            sendRenderPing(this.contentWindow);
          }}
        />
      <//>`,
      $button = html`<${Button}
        onclick=${$modal.open}
        notifications=${(await checkForUpdate()) ? 1 : 0}
        themeOverridesLoaded=${await doThemeOverride(db)}
        icon="notion-enhancer${menuButtonIconStyle === "Monochrome"
          ? "?mask"
          : " text-[16px]"}"
        >notion-enhancer
      <//>`;
    document.body.append($modal);
    addMutationListener(notionSidebar, () => {
      if (document.contains($button)) return;
      document.querySelector(notionSidebar)?.append($button);
    });
    document.querySelector(notionSidebar)?.append($button);
    addMutationListener("body", sendThemePing);
    window.addEventListener("focus", sendRenderPing);

    addKeyListener(openMenuHotkey, (event) => {
      event.preventDefault();
      $modal.open();
    });
    window.addEventListener("message", (event) => {
      if (event.data?.namespace !== "notion-enhancer") return;
      if (event.data?.action === "close-menu") $modal.close();
      if (event.data?.action === "open-menu") $modal.open();
    });
    onMessage("notion-enhancer", (message) => {
      if (message === "open-menu") $modal.open();
    });
  },
  sendTelemetryPing = async () => {
    const { version } = globalThis.__enhancerApi,
      db = globalThis.__enhancerApi.initDatabase(),
      agreedToTerms = await db.get("agreedToTerms"),
      telemetryEnabled = await db.get("telemetryEnabled");
    if (!telemetryEnabled || agreedToTerms !== version) return;
    // telemetry
  };

export default async (api, db) => {
  await Promise.all([
    overrideThemes(db),
    insertCustomStyles(db),
    insertMenu(db),
    sendTelemetryPing(),
  ]);
  api.sendMessage("notion-enhancer", "load-complete");
};
