/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { html, append } from "../common/domUtils.mjs";

export default async () => {
  const notionSidebar = `.notion-sidebar-container .notion-sidebar > :nth-child(3) > div > :nth-child(2)`,
    openMenu = html`<div
      tabindex="0"
      role="button"
      onClick=${() => {}}
      class="flex select-none cursor-pointer transition duration-[20ms] ease-in hover:bg-[rgba(255,255,255,0.055)] rounded-[3px] text-[14px] mx-[4px] px-[10px] py-[2px] my-px"
    >
      <div class="flex items-center justify-center w-[22px] h-[22px] mr-[8px]">
        <i class="i-notion-enhancer text-[16px]"></i>
      </div>
      <div>notion-enhancer</div>
    </div>`;

  append(openMenu, notionSidebar);
};
