/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web, fs, registry } from './helpers.js';

export default () => {
  web.whenReady([], async () => {
    web.loadStyleset('/src/client.css');
    for (let mod of await registry.get()) {
      for (let sheet of mod.css?.client || []) {
        web.loadStyleset(`/repo/${mod._dir}/${sheet}`);
      }
      for (let script of mod.js?.client || []) {
        import(chrome.runtime.getURL(`/repo/${mod._dir}/${script}`));
      }
    }
  });

  const sidebarSelector =
    '#notion-app > div > div.notion-cursor-listener > div.notion-sidebar-container > div > div > div > div:nth-child(4)';
  web.whenReady([sidebarSelector], async () => {
    const enhancerIcon = await fs.getText('/icons/colour.svg'),
      enhancerSidebarElement = web.createElement(
        `<div class="enhancer--sidebarMenuTrigger" role="button" tabindex="0"><div><div>${enhancerIcon}</div><div><div>notion-enhancer</div></div></div></div>`
      );
    enhancerSidebarElement.addEventListener('click', (event) =>
      chrome.runtime.sendMessage({ type: 'openEnhancerMenu' })
    );
    document.querySelector(sidebarSelector).appendChild(enhancerSidebarElement);
  });
};
