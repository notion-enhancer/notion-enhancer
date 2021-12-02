/*
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
    bodyContainerSelector = '.body-container',
    sidebarSelector = '.sidebar';
  if (tilingMode) return;

  await web.whenReady([bodyContainerSelector, sidebarSelector]);
  const $bodyContainer = document.querySelector(bodyContainerSelector),
    $dragarea = web.html`<div class="integrated_titlebar--dragarea" style="height:${dragareaHeight}px"></div>`;
  document.body.prepend($dragarea);
  $bodyContainer.style.height = `calc(100% - ${dragareaHeight}px)`;

  const $sidebar = document.querySelector(sidebarSelector),
    $windowButtons = await createWindowButtons(api, db);
  $windowButtons.dataset.inEnhancerMenu = true;
  $sidebar.prepend($windowButtons);
}
