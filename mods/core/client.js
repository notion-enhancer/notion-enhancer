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
    if (event.code === 'F5') window.reload();
    if (event.key === 'e' && (event.ctrlKey || event.metaKey))
      electron.ipcRenderer.send('enhancer:open-extension-menu');
  });

  const attempt_interval = setInterval(enhance, 500);
  async function enhance() {
    if (!document.querySelector('.notion-frame')) return;
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
        '--configured-dragarea_height',
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

    let sidebar_width;
    function communicationLoop() {
      const getStyle = (prop) =>
          getComputedStyle(document.body).getPropertyValue(prop),
        mode = JSON.parse(localStorage.theme).mode;

      // ctrl+f theming
      notionIpc.sendNotionToIndex('search:set-theme', {
        'mode': mode,
        'colors': {
          'white': getStyle(`--theme_${mode}--todo_ticked-fill`),
          'blue': getStyle(`--theme_${mode}--primary`),
        },
        'borderRadius': 3,
        'textColor': getStyle(`--theme_${mode}--text`),
        'popoverBackgroundColor': getStyle(`--theme_${mode}--card`),
        'popoverBoxShadow': `0 0 0 1px ${getStyle(
          `--theme_${mode}--overlay`
        )}, 0 3px 6px ${getStyle(`--theme_${mode}--overlay`)}`,
        'inputBoxShadow': `box-shadow: ${getStyle(
          `--theme_${mode}--primary`
        )} 0px 0px 0px 1px inset, ${getStyle(
          `--theme_${mode}--primary_hover`
        )} 0px 0px 0px 2px !important`,
        'inputBackgroundColor': getStyle(`--theme_${mode}--main`),
        'dividerColor': getStyle(`--theme_${mode}--table-border`),
        'shadowOpacity': 0.2,
      });

      // enhancer menu
      electron.ipcRenderer.send('enhancer:set-theme', {
        mode,
        rules: require('./css/variables.json').map((rule) => [
          rule,
          getStyle(rule),
        ]),
      });

      // draggable area resizing
      const sidebar = document.querySelector('.notion-sidebar');
      if (store().frameless && sidebar) {
        let new_sidebar_width =
          sidebar.style.height === 'auto' ? '0px' : sidebar.style.width;
        if (sidebar_width !== new_sidebar_width) {
          sidebar_width = new_sidebar_width;
          electron.ipcRenderer.sendToHost(
            'enhancer:sidebar-width',
            sidebar_width
          );
        }
      }
    }
    setInterval(communicationLoop, 500);
  }
};
