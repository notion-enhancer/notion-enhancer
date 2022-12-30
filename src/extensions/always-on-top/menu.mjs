/**
 * notion-enhancer: always on top
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { createButton } from './button.mjs';

export default async function (api, db) {
  const { web } = api,
    sidebarSelector = '.sidebar',
    windowButtonsSelector = '.integrated_titlebar--buttons';

  await web.whenReady([sidebarSelector]);
  await new Promise(requestAnimationFrame);
  const $sidebar = document.querySelector(sidebarSelector),
    $windowButtons = document.querySelector(windowButtonsSelector),
    $button = await createButton(api, db);
  ($windowButtons || $sidebar).prepend($button);
}
