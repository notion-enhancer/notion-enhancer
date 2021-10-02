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

const svgExpand = web.raw`<svg viewBox="-1 -1 9 11">
  <path d="M 3.5 0L 3.98809 -0.569442L 3.5 -0.987808L 3.01191 -0.569442L 3.5 0ZM 3.5 9L 3.01191
    9.56944L 3.5 9.98781L 3.98809 9.56944L 3.5 9ZM 0.488094 3.56944L 3.98809 0.569442L 3.01191
    -0.569442L -0.488094 2.43056L 0.488094 3.56944ZM 3.01191 0.569442L 6.51191 3.56944L 7.48809
    2.43056L 3.98809 -0.569442L 3.01191 0.569442ZM -0.488094 6.56944L 3.01191 9.56944L 3.98809
    8.43056L 0.488094 5.43056L -0.488094 6.56944ZM 3.98809 9.56944L 7.48809 6.56944L 6.51191
    5.43056L 3.01191 8.43056L 3.98809 9.56944Z"></path>
</svg>`;

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

    // opening/closing
    const $notionFrame = document.querySelector('.notion-frame'),
      $notionRightSidebar = document.querySelector(notionRightSidebarSelector),
      $pinnedToggle = web.html`<div id="enhancer--panel-header-toggle"><div>
        ${await components.feather('chevrons-right')}
      </div></div>`,
      $hoverTrigger = web.html`<div id="enhancer--panel-hover-trigger"></div>`,
      panelPinnedAttr = 'data-enhancer-panel-pinned',
      isPinned = () => $panel.hasAttribute(panelPinnedAttr),
      togglePanel = () => {
        const $elems = [$notionRightSidebar, $notionFrame, $hoverTrigger, $panel];
        if (isPinned()) {
          closeSwitcher();
          for (const $elem of $elems) $elem.removeAttribute(panelPinnedAttr);
        } else {
          for (const $elem of $elems) $elem.setAttribute(panelPinnedAttr, 'true');
        }
        db.set(['panel.pinned'], isPinned());
      };
    if (await db.get(['panel.pinned'])) togglePanel();
    web.addHotkeyListener(await db.get(['panel.hotkey']), togglePanel);
    $pinnedToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      togglePanel();
    });

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
    const $title = web.html`<div id="enhancer--panel-header-title"></div>`,
      $header = web.render(web.html`<div id="enhancer--panel-header"></div>`, $title),
      $content = web.html`<div id="enhancer--panel-content"></div>`,
      $switcherTrigger = web.html`<div id="enhancer--panel-header-switcher">
        ${svgExpand}
      </div>`,
      $notionApp = document.querySelector('.notion-app-inner'),
      $switcherOverlayContainer = web.html`<div id="enhancer--panel-switcher-overlay-container"></div>`,
      $switcher = web.html`<div id="enhancer--panel-switcher"></div>`,
      isSwitcherOpen = () => document.body.contains($switcher),
      renderView = (view) => {
        web.render(
          web.empty($title),
          web.render(
            web.html`<p class="enhancer--panel-view-title"></p>`,
            view.icon,
            view.title
          )
        );
        web.render(web.empty($content), view.$elem);
      },
      openSwitcher = () => {
        if (!isPinned()) return togglePanel();
        web.render($notionApp, $switcherOverlayContainer);
        web.empty($switcher);
        for (const view of _views) {
          const $item = web.render(
            web.html`<div class="enhancer--panel-switcher-item" tabindex="0"></div>`,
            web.render(
              web.html`<p class="enhancer--panel-view-title"></p>`,
              view.icon.cloneNode(true),
              view.title.cloneNode(true)
            )
          );
          $item.addEventListener('click', () => renderView(view));
          web.render($switcher, $item);
        }
        const rect = $header.getBoundingClientRect();
        web.render(
          web.empty($switcherOverlayContainer),
          web.render(
            web.html`<div style="position: fixed; top: ${rect.top}px; left: ${rect.left}px;
              width: ${rect.width}px; height: ${rect.height}px;"></div>`,
            web.render(
              web.html`<div style="position: relative; top: 100%; pointer-events: auto;"></div>`,
              $switcher
            )
          )
        );
        $switcher.firstElementChild.focus();
        $switcher.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      };
    function closeSwitcher() {
      $switcher.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).onfinish = () =>
        $switcherOverlayContainer.remove();
    }
    web.addHotkeyListener(['Escape'], () => {
      if (isSwitcherOpen()) closeSwitcher();
    });
    web.addHotkeyListener(['Enter'], () => {
      if (isSwitcherOpen()) document.activeElement.click();
    });
    document.addEventListener('keydown', (event) => {
      if (isSwitcherOpen()) {
        if (event.key === 'ArrowUp') {
          const $prev = event.target.previousElementSibling;
          ($prev || event.target.parentElement.lastElementChild).focus();
          event.stopPropagation();
        }
        if (event.key === 'ArrowDown') {
          const $next = event.target.nextElementSibling;
          ($next || event.target.parentElement.firstElementChild).focus();
          event.stopPropagation();
        }
      }
    });
    $header.addEventListener('click', openSwitcher);
    $switcherTrigger.addEventListener('click', openSwitcher);
    $switcherOverlayContainer.addEventListener('click', closeSwitcher);
    renderView(_views[0]);

    web.render(
      $panel,
      web.render($header, $title, $switcherTrigger, $pinnedToggle),
      $content,
      $resizeHandle
    );
    $notionRightSidebar.after($hoverTrigger, $panel);
  }
};
