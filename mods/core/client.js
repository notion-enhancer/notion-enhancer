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
    __notion = helpers.getNotion(),
    notionIpc = require(`${__notion.replace(
      /\\/g,
      '/'
    )}/app/helpers/notionIpc.js`);

  // additional hotkeys
  document.defaultView.addEventListener('keyup', (event) => {
    if (event.code === 'F5') location.reload();
    if (event.key === 'e' && (event.ctrlKey || event.metaKey))
      electron.ipcRenderer.send('enhancer:open-extension-menu');
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
    if (store().smooth_scrollbars) {
      document.body.classList.add('smooth-scrollbars');
      // interval_attempts.patchScrollbars = setInterval(patchScrollbars, 100);
      // function patchScrollbars() {
      //   const sidebar = document.querySelector(
      //     '.notion-scroller.vertical[style*="overflow: hidden auto;"]'
      //   );
      //   if (!sidebar) return;
      //   clearInterval(interval_attempts.patchScrollbars);
      //   sidebar.style.overflow = '';
      //   setTimeout(() => {
      //     sidebar.style.overflow = 'hidden auto';
      //   }, 10);
      // }
    }

    // frameless
    if (store().frameless) {
      document.body.classList.add('frameless');
      // draggable area
      const dragarea = document.createElement('div');
      dragarea.className = 'window-dragarea';
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
      if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
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
    function setMenuTheme() {
      electron.ipcRenderer.send('enhancer:set-menu-theme', {
        mode: document.querySelector('.notion-dark-theme') ? 'dark' : 'light',
        rules: require('./css/variables.json').map((rule) => [
          rule,
          getStyle(rule),
        ]),
      });
    }
    setMenuTheme();
    electron.ipcRenderer.on('enhancer:get-menu-theme', setMenuTheme);

    const observer = new MutationObserver(setSidebarWidth);
    observer.observe(document.querySelector('.notion-sidebar'), {
      attributes: true,
    });
    let sidebar_width;
    function setSidebarWidth(list, observer) {
      if (!store().frameless) return;
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
