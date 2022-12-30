/**
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { createWindowButtons } from './buttons.mjs';

export default async function (api, db) {
  const { web } = api,
    tilingMode = await db.get(['tiling']),
    dragareaHeight = await db.get(['dragarea_height']),
    sidebarSelector = '.sidebar';
  if (tilingMode) return;

  await web.whenReady([sidebarSelector]);
  const $dragarea = web.html`<div class="integrated_titlebar--dragarea"></div>`;
  document.body.prepend($dragarea);
  document.documentElement.style.setProperty(
    '--integrated_titlebar--dragarea-height',
    dragareaHeight + 'px'
  );

  const $sidebar = document.querySelector(sidebarSelector),
    $windowButtons = await createWindowButtons(api, db);
  $sidebar.prepend($windowButtons);
}
