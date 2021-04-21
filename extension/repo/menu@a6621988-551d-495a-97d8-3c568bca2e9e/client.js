/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = 'a6621988-551d-495a-97d8-3c568bca2e9e';
import { env, storage, web, fs } from '../../helpers.js';

const sidebarSelector =
  '#notion-app > div > div.notion-cursor-listener > div.notion-sidebar-container > div > div > div > div:nth-child(4)';
web.whenReady([sidebarSelector], async () => {
  const enhancerIcon = await fs.getText('icons/colour.svg'),
    enhancerSidebarElement = web.createElement(
      `<div class="enhancer--sidebarMenuTrigger" role="button" tabindex="0"><div><div>${enhancerIcon}</div><div><div>notion-enhancer</div></div></div></div>`
    );
  const setTheme = () =>
    storage.set(_id, 'theme', document.querySelector('.notion-dark-theme') ? 'dark' : 'light');
  enhancerSidebarElement.addEventListener('click', () => {
    setTheme().then(env.openEnhancerMenu);
  });
  window.addEventListener('focus', setTheme);
  window.addEventListener('blur', setTheme);
  setTheme();
  document.querySelector(sidebarSelector).appendChild(enhancerSidebarElement);
});
web.hotkeyListener(['Ctrl', 'Alt', 'E'], env.openEnhancerMenu);
