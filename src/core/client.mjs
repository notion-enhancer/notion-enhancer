/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { checkForUpdate } from "./updateCheck.mjs";
import { sendTelemetryPing } from "./sendTelemetry.mjs";
import { Modal, Frame } from "./islands/Modal.mjs";
import { MenuButton } from "./islands/MenuButton.mjs";
import { TopbarButton } from "./islands/TopbarButton.mjs";
import { Panel } from "./islands/Panel.mjs";

const shouldLoadThemeOverrides = async (api, db) => {
    const { getMods, isEnabled } = api,
      loadThemeOverrides = await db.get("loadThemeOverrides");
    if (loadThemeOverrides === "Enabled") return true;
    if (loadThemeOverrides === "Disabled") return false;
    // prettier-ignore
    // loadThemeOverrides === "Auto"
    return (await getMods(async (mod) => {
      if (!mod._src.startsWith("themes/")) return false;
      return await isEnabled(mod.id);
    })).length;
  },
  loadThemeOverrides = async (api, db) => {
    const { html, enhancerUrl } = api;
    if (!(await shouldLoadThemeOverrides(api, db))) return;
    document.head.append(html`<link
      rel="stylesheet"
      href=${enhancerUrl("core/theme.css")}
    />`);
  },
  insertCustomStyles = async (api, db) => {
    const { html } = api,
      customStyles = (await db.get("customStyles"))?.content;
    if (!customStyles) return;
    return document.head.append(html`<style>
      ${customStyles}
    </style>`);
  };

const insertMenu = async (api, db) => {
  const notionSidebar = `.notion-sidebar-container .notion-sidebar > :nth-child(3) > div > :nth-child(2)`,
    notionSettingsAndMembers = `${notionSidebar} > [role="button"]:nth-child(3)`,
    { html, addKeyListener, addMutationListener } = api,
    { platform, enhancerUrl, onMessage } = api,
    menuButtonIconStyle = await db.get("menuButtonIconStyle"),
    openMenuHotkey = await db.get("openMenuHotkey"),
    menuPing = {
      channel: "notion-enhancer",
      hotkey: openMenuHotkey,
      icon: menuButtonIconStyle,
    };

  let _contentWindow;
  const updateMenuTheme = () => {
      const darkMode = document.body.classList.contains("dark"),
        notionTheme = darkMode ? "dark" : "light";
      if (menuPing.theme === notionTheme) return;
      menuPing.theme = notionTheme;
      _contentWindow?.postMessage?.(menuPing, "*");
    },
    triggerMenuRender = (contentWindow) => {
      _contentWindow ??= contentWindow;
      if (!$modal.hasAttribute("open")) return;
      _contentWindow?.focus?.();
      delete menuPing.theme;
      updateMenuTheme();
    };

  const $modal = html`<${Modal} onopen=${triggerMenuRender}>
      <${Frame}
        title="notion-enhancer menu"
        src="${enhancerUrl("core/menu/index.html")}"
        onload=${function () {
          // pass notion-enhancer api to electron menu process
          if (["linux", "win32", "darwin"].includes(platform)) {
            const apiKey = "__enhancerApi";
            this.contentWindow[apiKey] = globalThis[apiKey];
          }
          triggerMenuRender(this.contentWindow);
        }}
      />
    <//>`,
    $button = html`<${MenuButton}
      onclick=${$modal.open}
      notifications=${(await checkForUpdate()) ? 1 : 0}
      themeOverridesLoaded=${await shouldLoadThemeOverrides(api, db)}
      icon="notion-enhancer${menuButtonIconStyle === "Monochrome"
        ? "?mask"
        : " text-[16px]"}"
      >notion-enhancer
    <//>`;
  const appendToDom = () => {
    if (!document.contains($modal)) document.body.append($modal);
    if (!document.querySelector(notionSidebar)?.contains($button))
      document.querySelector(notionSettingsAndMembers)?.after($button);
  };
  addMutationListener(notionSidebar, appendToDom);
  addMutationListener("body", updateMenuTheme);
  appendToDom();

  addKeyListener(openMenuHotkey, (event) => {
    event.preventDefault();
    event.stopPropagation();
    $modal.open();
  });
  window.addEventListener("focus", triggerMenuRender);
  window.addEventListener("message", (event) => {
    // from embedded menu
    if (event.data?.channel !== "notion-enhancer") return;
    if (event.data?.action === "close-menu") $modal.close();
    if (event.data?.action === "open-menu") $modal.open();
  });
  onMessage("notion-enhancer", (message) => {
    // from worker
    if (message === "open-menu") $modal.open();
  });
};

const insertPanel = async (api, db) => {
  const notionFrame = ".notion-frame",
    notionTopbarBtn = ".notion-topbar-more-button",
    togglePanelHotkey = await db.get("togglePanelHotkey"),
    { addPanelView, addMutationListener, addKeyListener } = api,
    { html, setState, useState } = api;

  const $panel = html`<${Panel}
    ...${Object.assign(
      ...["Width", "Open", "View"].map((key) => ({
        [`_get${key}`]: () => db.get(`sidePanel${key}`),
        [`_set${key}`]: async (value) => {
          await db.set(`sidePanel${key}`, value);
          setState({ rerender: true });
        },
      }))
    )}
  />`;

  const $helloThere = html`<div class="p-[16px]">hello there</div>`,
    $generalKenobi = html`<div class="p-[16px]">general kenobi</div>`;
  addPanelView({
    title: "outliner",
    // prettier-ignore
    $icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="5" cy="7" r="2.8"/>
      <circle cx="5" cy="17" r="2.79"/>
      <path d="M21,5.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,5.5,21.55,5.95,21,5.95z"/>
      <path d="M17,10.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,9.6,17.55,10.05,17,10.05z"/>
      <path d="M21,15.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,15.5,21.55,15.95,21,15.95z" />
      <path d="M17,20.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,19.6,17.55,20.05,17,20.05z"/>
    </svg>`,
    $view: $helloThere,
  });
  addPanelView({
    title: "word counter",
    $icon: "type",
    $view: $generalKenobi,
  });
  // setTimeout(() => {
  //   removePanelView($helloThere);
  //   removePanelView($generalKenobi);
  // }, 5000);

  const $panelTopbarBtn = html`<${TopbarButton}
      aria-label="Open side panel"
      icon="panel-right"
      onclick=${$panel.toggle}
    />`,
    appendToDom = () => {
      const $frame = document.querySelector(notionFrame);
      if (!$frame) return;
      if (!$frame.contains($panel)) $frame.append($panel);
      if (!$frame.style.flexDirection !== "row")
        $frame.style.flexDirection = "row";
      if (!document.contains($panelTopbarBtn)) {
        const $notionTopbarBtn = document.querySelector(notionTopbarBtn);
        $notionTopbarBtn?.before($panelTopbarBtn);
      }
    };
  addMutationListener(`${notionFrame}, ${notionTopbarBtn}`, appendToDom);
  appendToDom();

  useState(["panelOpen"], ([panelOpen]) => {
    if (panelOpen) $panelTopbarBtn.setAttribute("data-active", true);
    else $panelTopbarBtn.removeAttribute("data-active");
  });
  useState(["panelViews"], ([panelViews = []]) => {
    $panelTopbarBtn.style.display = panelViews.length ? "" : "none";
  });

  addKeyListener(togglePanelHotkey, (event) => {
    event.preventDefault();
    event.stopPropagation();
    $panel.toggle();
  });
};

export default async (api, db) =>
  Promise.all([
    insertMenu(api, db),
    insertPanel(api, db),
    insertCustomStyles(api, db),
    loadThemeOverrides(api, db),
    sendTelemetryPing(),
  ]).then(() => api.sendMessage("notion-enhancer", "load-complete"));
