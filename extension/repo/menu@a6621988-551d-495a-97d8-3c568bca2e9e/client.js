/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web, fs, env } from '../../helpers.js';

const sidebarSelector =
  '#notion-app > div > div.notion-cursor-listener > div.notion-sidebar-container > div > div > div > div:nth-child(4)';
web.whenReady([sidebarSelector], async () => {
  const enhancerIcon = await fs.getText('icons/colour.svg'),
    enhancerSidebarElement = web.createElement(
      `<div class="enhancer--sidebarMenuTrigger" role="button" tabindex="0"><div><div>${enhancerIcon}</div><div><div>notion-enhancer</div></div></div></div>`
    );
  enhancerSidebarElement.addEventListener('click', env.openEnhancerMenu);
  document.querySelector(sidebarSelector).appendChild(enhancerSidebarElement);
});
web.hotkeyListener(['Ctrl', 'Alt', 'E'], env.openEnhancerMenu);
