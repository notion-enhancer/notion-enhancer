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
web.whenReady([sidebarSelector]).then(async () => {
  const $enhancerSidebarElement = web.createElement(
      web.html`<div class="enhancer--sidebarMenuTrigger" role="button" tabindex="0">
        <div>
          <div>${await fs.getText('icons/colour.svg')}</div>
          <div><div>notion-enhancer</div></div>
        </div>
      </div>`
    ),
    notifications = {
      list: await fs.getJSON('https://notion-enhancer.github.io/notifications.json'),
      dismissed: await storage.get(_id, 'notifications', []),
    };
  notifications.waiting = notifications.list.filter(
    ({ id }) => !notifications.dismissed.includes(id)
  );
  if (notifications.waiting.length) {
    $enhancerSidebarElement.classList.add('enhancer--notifications');
    $enhancerSidebarElement.children[0].append(
      web.createElement(
        web.html`<div><div><span>${notifications.waiting.length}</span></div></div>`
      )
    );
  }
  const setTheme = () =>
    storage.set(_id, 'theme', document.querySelector('.notion-dark-theme') ? 'dark' : 'light');
  $enhancerSidebarElement.addEventListener('click', () => {
    setTheme().then(env.openEnhancerMenu);
  });
  window.addEventListener('focus', setTheme);
  window.addEventListener('blur', setTheme);
  setTheme();
  document.querySelector(sidebarSelector).appendChild($enhancerSidebarElement);
});
web.hotkeyListener(await storage.get(_id, 'hotkey.focustoggle'), env.openEnhancerMenu);
