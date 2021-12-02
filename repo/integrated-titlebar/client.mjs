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
    sidebarSelector = '.notion-sidebar',
    panelSelector = '#enhancer--panel',
    topbarSelector = '.notion-topbar',
    topbarActionsSelector = '.notion-topbar-action-buttons';
  if (tilingMode) return;

  let sidebarWidth = '0px',
    panelWidth = '0px';
  const updateDragareaOffsets = () => {
    const $sidebar = document.querySelector(sidebarSelector),
      newSidebarWidth = $sidebar.style.height === 'auto' ? '0px' : $sidebar.style.width,
      $panel = document.querySelector(panelSelector),
      newPanelWidth =
        $panel && $panel.dataset.enhancerPanelPinned === 'true'
          ? window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--component--panel-width')
          : '0px';
    if (newSidebarWidth !== sidebarWidth) {
      sidebarWidth = newSidebarWidth;
      __enhancerElectronApi.sendMessageToHost('sidebar-width', sidebarWidth);
    }
    if (newPanelWidth !== panelWidth) {
      panelWidth = newPanelWidth;
      __enhancerElectronApi.sendMessageToHost('panel-width', panelWidth);
    }
  };
  web.addDocumentObserver(updateDragareaOffsets);

  await web.whenReady([topbarSelector, topbarActionsSelector]);
  const $topbar = document.querySelector(topbarSelector),
    $dragarea = web.html`<div class="integrated_titlebar--dragarea" style="height:${dragareaHeight}px"></div>`;
  $topbar.prepend($dragarea);

  const $topbarActions = document.querySelector(topbarActionsSelector),
    $windowButtons = await createWindowButtons(api, db);
  web.render($topbarActions.parentElement, $windowButtons);
}
