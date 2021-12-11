/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports, __eval) {
  const url = require('url'),
    electron = require('electron'),
    electronWindow = electron.remote.getCurrentWindow(),
    { components, web } = api;

  window['__start'] = async () => {
    const tabCache = new Map(),
      Tab = await require('./tab.cjs')(api, db, tabCache);
    document.body.dataset.tabLabels = await db.get(['label_type']);
    document.body.dataset.tabStyle = await db.get(['layout_style']);

    const $header = web.html`<header></header>`,
      $tabs = web.html`<div id="tabs"></div>`,
      $newTab = web.html`<div class="new-tab">${await components.feather('plus')}</div>`,
      $root = document.querySelector('#root'),
      $windowActions = web.html`<div id="window-actions"></div>`;
    document.body.prepend(web.render($header, $tabs, $newTab, $windowActions));

    new Tab($tabs, $root, {
      notionUrl: url.parse(window.location.href, true).query.path,
      cancelAnimation: true,
    });
    $newTab.addEventListener('click', () => new Tab($tabs, $root));
    electron.ipcRenderer.on('notion-enhancer:close-tab', (event, id) => {
      const tab = tabCache.get(id);
      if (tab) tab.close();
    });
    electron.ipcRenderer.on(
      'notion-enhancer:open-tab',
      (event, opts) => new Tab($tabs, $root, opts)
    );

    let $draggedTab;
    const $dragIndicator = web.html`<span class="drag-indicator"></span>`,
      getDragTarget = ($el) => {
        while (!$el.matches('.tab, header, body')) $el = $el.parentElement;
        if ($el.matches('header')) $el = $el.firstElementChild;
        return $el.matches('#tabs, .tab') ? $el : undefined;
      },
      resetDraggedTabs = () => {
        if ($draggedTab) {
          $dragIndicator.remove();
          $draggedTab.style.opacity = '';
          $draggedTab = undefined;
        }
      };
    $header.addEventListener('dragstart', (event) => {
      $draggedTab = getDragTarget(event.target);
      $draggedTab.style.opacity = 0.5;
      const tab = tabCache.get($draggedTab.id);
      event.dataTransfer.setData(
        'text',
        JSON.stringify({
          window: electronWindow.webContents.id,
          tab: $draggedTab.id,
          icon: tab.$tabIcon.innerText || tab.$tabIcon.style.background,
          title: tab.$tabTitle.innerText,
          url: tab.$notion.src,
        })
      );
    });
    $header.addEventListener('dragover', (event) => {
      const $target = getDragTarget(event.target);
      if ($target) {
        if ($target.matches('#tabs')) {
          $target.after($dragIndicator);
        } else if ($target.matches('#tabs > :first-child')) {
          $tabs.before($dragIndicator);
        } else $target.before($dragIndicator);
        event.preventDefault();
      }
    });
    document.addEventListener('drop', (event) => {
      const eventData = JSON.parse(event.dataTransfer.getData('text')),
        $target = getDragTarget(event.target) || $tabs,
        sameWindow = eventData.window === electronWindow.webContents.id,
        tabMovement =
          !sameWindow ||
          ($target &&
            $target !== $draggedTab &&
            $target !== $draggedTab.nextElementSibling &&
            ($target.matches('#tabs') ? $target.lastElementChild !== $draggedTab : true));
      if (!sameWindow) {
        electron.ipcRenderer.send('notion-enhancer:close-tab', {
          window: eventData.window,
          id: eventData.tab,
        });
        const transferred = new Tab($tabs, $root, {
          notionUrl: eventData.url,
          cancelAnimation: true,
          icon: eventData.icon,
          title: eventData.title,
        });
        $draggedTab = transferred.$tab;
      }
      if (tabMovement) {
        if ($target.matches('#tabs')) {
          $target.append($draggedTab);
        } else $target.before($draggedTab);
      }
      resetDraggedTabs();
    });
    $header.addEventListener('dragend', (event) => resetDraggedTabs());
  };
};
