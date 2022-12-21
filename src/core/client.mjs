/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { html } from "../common/dom.mjs";
import { addMutationListener } from "../common/events.mjs";

export default async () => {
  const { enhancerUrl } = globalThis.__enhancerApi,
    menuButtonIconStyle = "";

  const icon = `i-notion-enhancer${
    menuButtonIconStyle === "monochrome" ? "?mask" : " text-[16px]"
  }`;

  const modalBackground = html`<div class="notion-enhancer--menu-modal">
    <div onclick=${() => modalBackground.removeAttribute("data-open")}></div>
    <div>
      <iframe
        title="notion-enhancer menu"
        src="${enhancerUrl("core/menu.html")}"
      ></iframe>
    </div>
  </div>`;
  document.body.append(modalBackground);

  const notionSidebar = `.notion-sidebar-container .notion-sidebar > :nth-child(3) > div > :nth-child(2)`,
    menuButton = html`<div
      tabindex="0"
      role="button"
      class="notion-enhancer--menu-button"
      onclick=${() => {
        modalBackground.dataset.open = true;
      }}
    >
      <div><i class=${icon}></i></div>
      <div>notion-enhancer</div>
    </div>`,
    addToSidebar = () => {
      if (document.contains(menuButton)) return;
      document.querySelector(notionSidebar)?.append(menuButton);
    };
  addMutationListener(notionSidebar, addToSidebar);
  addToSidebar();
};
