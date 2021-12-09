/**
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { createWindowButtons } from './buttons.mjs';

export default async function (api, db) {
  const { web, registry, electron } = api,
    tilingMode = await db.get(['tiling']),
    dragareaHeight = await db.get(['dragarea_height']),
    tabsEnabled = await registry.enabled('e1692c29-475e-437b-b7ff-3eee872e1a42'),
    sidebarSelector = '.notion-sidebar',
    panelSelector = '#enhancer--panel',
    topbarSelector = '.notion-topbar',
    topbarActionsSelector = '.notion-topbar-action-buttons';
  if (tilingMode || tabsEnabled) return;

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
      electron.sendMessageToHost('sidebar-width', sidebarWidth);
    }
    if (newPanelWidth !== panelWidth) {
      panelWidth = newPanelWidth;
      electron.sendMessageToHost('panel-width', panelWidth);
    }
  };
  web.addDocumentObserver(updateDragareaOffsets);

  await web.whenReady([topbarSelector, topbarActionsSelector]);
  const $topbar = document.querySelector(topbarSelector),
    $dragarea = web.html`<div class="integrated_titlebar--dragarea"></div>`;
  $topbar.prepend($dragarea);
  document.documentElement.style.setProperty(
    '--integrated_titlebar--dragarea-height',
    dragareaHeight + 'px'
  );

  const $topbarActions = document.querySelector(topbarActionsSelector),
    $windowButtons = await createWindowButtons(api, db);
  web.render($topbarActions.parentElement, $windowButtons);
}
