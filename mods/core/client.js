/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 TarasokUA
 * under the MIT license
 */

'use strict';

module.exports = (store, __exports) => {
  const electron = require('electron'),
    helpers = require('../../pkg/helpers.js'),
    notionIpc = require(`${helpers.__notion.replace(
      /\\/g,
      '/'
    )}/app/helpers/notionIpc.js`);

  // additional hotkeys
  document.defaultView.addEventListener('keyup', (event) => {
    if (event.code === 'F5') location.reload();
  });

  const attempt_interval = setInterval(enhance, 500);
  async function enhance() {
    if (
      !document.querySelector('.notion-frame') ||
      !document.querySelector('.notion-sidebar')
    )
      return;
    clearInterval(attempt_interval);

    // scrollbars
    if (store().smooth_scrollbars)
      document.body.classList.add('smooth-scrollbars');

    // frameless
    if (store().frameless && !store().tiling_mode) {
      document.body.classList.add('frameless');
      // draggable area
      const dragarea = helpers.createElement(
        '<div class="window-dragarea"></div>'
      );
      document.querySelector('.notion-topbar').prepend(dragarea);
      document.documentElement.style.setProperty(
        '--configured--dragarea_height',
        `${store().dragarea_height + 2}px`
      );
    }

    // window buttons
    const buttons = require('./buttons.js')(store);
    document
      .querySelector('.notion-topbar > div[style*="display: flex"]')
      .appendChild(buttons.element);
    document
      .querySelector('.notion-history-back-button')
      .parentElement.nextElementSibling.classList.add(
        'notion-topbar-breadcrumb'
      );
    document
      .querySelector('.notion-topbar-share-menu')
      .parentElement.classList.add('notion-topbar-actions');

    const getStyle = (prop) =>
      getComputedStyle(
        document.querySelector('.notion-app-inner')
      ).getPropertyValue(prop);

    // ctrl+f theming
    document.defaultView.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        notionIpc.sendNotionToIndex('search:set-theme', {
          'mode': document.querySelector('.notion-dark-theme')
            ? 'dark'
            : 'light',
          'colors': {
            'white': getStyle(`--theme--option_active-color`),
            'blue': getStyle(`--theme--option_active-background`),
          },
          'borderRadius': 3,
          'textColor': getStyle(`--theme--text`),
          'popoverBackgroundColor': getStyle(`--theme--card`),
          'popoverBoxShadow': `0 0 0 1px ${getStyle(
            `--theme--overlay`
          )}, 0 3px 6px ${getStyle(`--theme--overlay`)}`,
          'inputBoxShadow': `box-shadow: ${getStyle(
            `--theme--primary`
          )} 0px 0px 0px 1px inset, ${getStyle(
            `--theme--primary_hover`
          )} 0px 0px 0px 2px !important`,
          'inputBackgroundColor': getStyle(`--theme--main`),
          'dividerColor': getStyle(`--theme--table-border`),
          'shadowOpacity': 0.2,
        });
      }
    });

    // enhancer menu
    function setThemeVars() {
      electron.ipcRenderer.send(
        'enhancer:set-theme-vars',
        [
          '--theme--main',
          '--theme--sidebar',
          '--theme--overlay',
          '--theme--dragarea',
          '--theme--font_sans',
          '--theme--font_code',
          '--theme--scrollbar',
          '--theme--scrollbar-border',
          '--theme--scrollbar_hover',
          '--theme--card',
          '--theme--table-border',
          '--theme--interactive_hover',
          '--theme--interactive_hover-border',
          '--theme--button_close',
          '--theme--button_close-fill',
          '--theme--primary',
          '--theme--primary_click',
          '--theme--option-color',
          '--theme--option-background',
          '--theme--option_active-background',
          '--theme--option_active-color',
          '--theme--option_hover-color',
          '--theme--option_hover-background',
          '--theme--text',
          '--theme--text_ui',
          '--theme--text_ui_info',
          '--theme--select_yellow',
          '--theme--select_green',
          '--theme--select_blue',
          '--theme--select_red',
          '--theme--line_text',
          '--theme--line_yellow',
          '--theme--line_green',
          '--theme--line_blue',
          '--theme--line_red',
          '--theme--code_inline-text',
          '--theme--code_inline-background',
        ].map((rule) => [rule, getStyle(rule)])
      );
    }
    setThemeVars();
    const theme_observer = new MutationObserver(setThemeVars);
    theme_observer.observe(document.querySelector('.notion-app-inner'), {
      attributes: true,
    });
    electron.ipcRenderer.on('enhancer:get-theme-vars', setThemeVars);

    const sidebar_observer = new MutationObserver(setSidebarWidth);
    sidebar_observer.observe(document.querySelector('.notion-sidebar'), {
      attributes: true,
    });
    let sidebar_width;
    function setSidebarWidth(list) {
      if (!store().frameless && store().tiling_mode) return;
      const new_sidebar_width =
        list[0].target.style.height === 'auto'
          ? '0px'
          : list[0].target.style.width;
      if (new_sidebar_width !== sidebar_width) {
        sidebar_width = new_sidebar_width;
        electron.ipcRenderer.sendToHost(
          'enhancer:sidebar-width',
          sidebar_width
        );
      }
    }
    setSidebarWidth([{ target: document.querySelector('.notion-sidebar') }]);
  }
};
