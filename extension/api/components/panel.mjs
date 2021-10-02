/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * shared notion-style elements
 * @module notion-enhancer/api/components/side-panel
 */

import { web, components, registry } from '../_.mjs';
const db = await registry.db('36a2ffc9-27ff-480e-84a7-c7700a7d232d');

let $panel,
  _views = [];

export const panel = async (icon, title, generator = () => {}) => {
  _views.push({
    icon: web.html`${icon}`,
    title: web.html`<span>${web.escape(title)}</span>`,
    $elem: generator(),
  });

  if (!$panel) {
    $panel = web.html`<div id="enhancer--panel"></div>`;

    const notionRightSidebarSelector = '.notion-cursor-listener > div[style*="flex-end"]';
    await web.whenReady([notionRightSidebarSelector]);
    web.loadStylesheet('api/components/panel.css');

    const $title = web.html`<div id="enhancer--panel-header-title"></div>`,
      $header = web.render(web.html`<div id="enhancer--panel-header"></div>`, $title),
      $content = web.html`<div id="enhancer--panel-content"></div>`;

    // opening/closing
    const $notionFrame = document.querySelector('.notion-frame'),
      $notionRightSidebar = document.querySelector(notionRightSidebarSelector),
      $pinnedToggle = web.html`<div id="enhancer--panel-header-toggle">
        ${await components.feather('chevrons-right')}
      </div>`,
      $hoverTrigger = web.html`<div id="enhancer--panel-hover-trigger"></div>`,
      panelPinnedAttr = 'data-enhancer-panel-pinned',
      isPinned = () => $panel.hasAttribute(panelPinnedAttr),
      isRightSidebarOpen = () =>
        $notionRightSidebar.matches('[style*="border-left: 1px solid rgba(0, 0, 0, 0)"]'),
      togglePanel = () => {
        const $elems = [$notionRightSidebar, $hoverTrigger, $panel];
        if (isPinned()) {
          if (isRightSidebarOpen()) $elems.push($notionFrame);
          for (const $elem of $elems) $elem.removeAttribute(panelPinnedAttr);
        } else {
          $elems.push($notionFrame);
          for (const $elem of $elems) $elem.setAttribute(panelPinnedAttr, 'true');
        }
        db.set(['panel.pinned'], isPinned());
      };
    web.addDocumentObserver(() => {
      if (isPinned()) {
        if (isRightSidebarOpen()) {
          $notionFrame.removeAttribute(panelPinnedAttr);
        } else {
          $notionFrame.setAttribute(panelPinnedAttr, 'true');
        }
      }
    }, [notionRightSidebarSelector]);
    if (await db.get(['panel.pinned'])) togglePanel();
    web.addHotkeyListener(await db.get(['panel.hotkey']), togglePanel);
    $pinnedToggle.addEventListener('click', togglePanel);

    // resizing
    let dragStartX,
      dragStartWidth,
      dragEventsFired,
      panelWidth = await db.get(['panel.width'], 240);
    const $resizeHandle = web.html`<div id="enhancer--panel-resize"><div></div></div>`,
      updateWidth = async () => {
        document.documentElement.style.setProperty(
          '--component--panel-width',
          panelWidth + 'px'
        );
        db.set(['panel.width'], panelWidth);
      },
      resizeDrag = (event) => {
        event.preventDefault();
        dragEventsFired = true;
        panelWidth = dragStartWidth + (dragStartX - event.clientX);
        if (panelWidth < 190) panelWidth = 190;
        if (panelWidth > 480) panelWidth = 480;
        $panel.style.width = panelWidth + 'px';
        $hoverTrigger.style.width = panelWidth + 'px';
        $notionFrame.style.paddingRight = panelWidth + 'px';
        $notionRightSidebar.style.right = panelWidth + 'px';
      },
      resizeEnd = (event) => {
        $panel.style.width = '';
        $hoverTrigger.style.width = '';
        $notionFrame.style.paddingRight = '';
        $notionRightSidebar.style.right = '';
        updateWidth();
        $resizeHandle.style.cursor = '';
        document.body.removeEventListener('mousemove', resizeDrag);
        document.body.removeEventListener('mouseup', resizeEnd);
      },
      resizeStart = (event) => {
        dragStartX = event.clientX;
        dragStartWidth = panelWidth;
        $resizeHandle.style.cursor = 'auto';
        document.body.addEventListener('mousemove', resizeDrag);
        document.body.addEventListener('mouseup', resizeEnd);
      };
    updateWidth();
    $resizeHandle.addEventListener('mousedown', resizeStart);
    $resizeHandle.addEventListener('click', () => {
      if (dragEventsFired) {
        dragEventsFired = false;
      } else togglePanel();
    });

    // view selection
    const $switcherTrigger = web.html`<div id="enhancer--panel-header-switcher">
        ${await components.feather('chevron-up')}
        ${await components.feather('chevron-down')}
      </div>`,
      renderView = (view) => {
        web.render(web.empty($title), web.render(web.html`<p></p>`, view.icon, view.title));
        web.render(web.empty($content), view.$elem);
      };
    renderView(_views[0]);

    web.render(
      $panel,
      web.render($header, $switcherTrigger, $title, $pinnedToggle),
      $content,
      $resizeHandle
    );
    $notionRightSidebar.after($hoverTrigger, $panel);
  }
};
