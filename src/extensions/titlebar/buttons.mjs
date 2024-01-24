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

const createWindowButtons = () => {
  const { html, sendMessage, invokeInWorker } = globalThis.__enhancerApi,
    $minimize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "minimize")}
      aria-label="${minimizeLabel}"
      icon="minus"
    />`,
    $maximize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "maximize")}
      aria-label="${maximizeLabel}"
      icon="maximize"
    />`,
    $unmaximize = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "unmaximize")}
      aria-label="${unmaximizeLabel}"
      icon="minimize"
    />`,
    $close = html`<${TopbarButton}
      onclick=${() => sendMessage("notion-enhancer:titlebar", "close")}
      class="!hover:(bg-red-600 text-white)"
      aria-label="${closeLabel}"
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
  window.addEventListener("resize", resizeWindow);
  resizeWindow();

  return html`<div>${$minimize}${$maximize}${$unmaximize}${$close}</div>`;
};

if (globalThis.IS_TABS) {
  const appendAfter = ".hide-scrollbar",
    $buttons = createWindowButtons();
  document.querySelector(appendAfter)?.after($buttons);
}

export { createWindowButtons };
