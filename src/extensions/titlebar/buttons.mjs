/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { Tooltip } from "../../core/islands/Tooltip.mjs";
import { TopbarButton } from "../../core/islands/TopbarButton.mjs";

const minimizeLabel = "Minimize window",
  maximizeLabel = "Maximize window",
  unmaximizeLabel = "Unmaximize window",
  closeLabel = "Close window";

const createWindowButtons = async () => {
  const { modDatabase } = globalThis.__enhancerApi,
    db = await modDatabase("a5658d03-21c6-4088-bade-fa4780459133"),
    minimizeIcon = await db.get("minimizeIcon"),
    maximizeIcon = await db.get("maximizeIcon"),
    unmaximizeIcon = await db.get("unmaximizeIcon"),
    closeIcon = await db.get("closeIcon");

  const { html, sendMessage, invokeInWorker } = globalThis.__enhancerApi,
    $minimize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "minimize")}
      aria-label="${minimizeLabel}"
      innerHTML="${minimizeIcon?.content}"
      icon="minus"
    />`,
    $maximize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "maximize")}
      aria-label="${maximizeLabel}"
      innerHTML="${maximizeIcon?.content}"
      icon="maximize"
    />`,
    $unmaximize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "unmaximize")}
      aria-label="${unmaximizeLabel}"
      innerHTML="${unmaximizeIcon?.content}"
      icon="minimize"
    />`,
    $close = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "close")}
      class="!hover:(bg-red-600 text-white)"
      aria-label="${closeLabel}"
      innerHTML="${closeIcon?.content}"
      icon="x"
    />`;
  html`<${Tooltip}><b>${minimizeLabel}</b><//>`.attach($minimize, "bottom");
  html`<${Tooltip}><b>${maximizeLabel}</b><//>`.attach($maximize, "bottom");
  html`<${Tooltip}><b>${unmaximizeLabel}</b><//>`.attach($unmaximize, "bottom");
  html`<${Tooltip}><b>${closeLabel}</b><//>`.attach($close, "bottom");

  const resizeWindow = async () => {
    const isMaximized = await invokeInWorker("notion-enhancer:titlebar", {
      query: "is-maximized",
    });
    $maximize.style.display = isMaximized ? "none" : "";
    $unmaximize.style.display = isMaximized ? "" : "none";
  };
  addEventListener("resize", resizeWindow);
  resizeWindow();

  return html`<div class="flex flex-nowrap">${$minimize}${$maximize}${$unmaximize}${$close}</div>`;
};

if (globalThis.IS_TABS) {
  const appendAfter = ".hide-scrollbar";
  createWindowButtons().then(($buttons) => {
    document.querySelector(appendAfter)?.after($buttons);
  });
}

export { createWindowButtons };
