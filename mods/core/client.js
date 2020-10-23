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
    )}/app/helpers/notionIpc.js`),
    { toKeyEvent } = require('keyboardevent-from-electron-accelerator'),
    tabsEnabled = (store('mods')['e1692c29-475e-437b-b7ff-3eee872e1a42'] || {})
      .enabled;

  document.defaultView.addEventListener('keyup', (event) => {
    // additional hotkeys
    if (event.key === 'F5') location.reload();
    // open menu on hotkey toggle
    const hotkey = toKeyEvent(store().menu_toggle);
    let triggered = true;
    for (let prop in hotkey)
      if (hotkey[prop] !== event[prop]) triggered = false;
    if (triggered) electron.ipcRenderer.send('enhancer:open-menu');
    if (tabsEnabled) {
      // switch between tabs via key modifier
      const select_tab_modifier = toKeyEvent(
        store('e1692c29-475e-437b-b7ff-3eee872e1a42').select_modifier
      );
      let triggered = true;
      for (let prop in select_tab_modifier)
        if (select_tab_modifier[prop] !== event[prop]) triggered = false;
      if (
        triggered &&
        [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'ArrowRight',
          'ArrowLeft',
        ].includes(event.key)
      )
        electron.ipcRenderer.sendToHost('enhancer:select-tab', event.key);
      // create/close tab keybindings
      const new_tab_keybinding = toKeyEvent(
        store('e1692c29-475e-437b-b7ff-3eee872e1a42').new_tab
      );
      triggered = true;
      for (let prop in new_tab_keybinding)
        if (new_tab_keybinding[prop] !== event[prop]) triggered = false;
      if (triggered) electron.ipcRenderer.sendToHost('enhancer:new-tab');
      const close_tab_keybinding = toKeyEvent(
        store('e1692c29-475e-437b-b7ff-3eee872e1a42').close_tab
      );
      triggered = true;
      for (let prop in close_tab_keybinding)
        if (close_tab_keybinding[prop] !== event[prop]) triggered = false;
      if (triggered) electron.ipcRenderer.sendToHost('enhancer:close-tab');
    }
  });

  const attempt_interval = setInterval(enhance, 500);
  async function enhance() {
    if (
      !document.querySelector('.notion-frame') ||
      !document.querySelector('.notion-sidebar')
    )
      return;
    clearInterval(attempt_interval);

    // toggleable styles
    if (store().smooth_scrollbars)
      document.body.classList.add('smooth-scrollbars');
    if (store().snappy_transitions)
      document.body.classList.add('snappy-transitions');

    // frameless
    if (store().frameless && !store().tiling_mode && !tabsEnabled) {
      document.body.classList.add('frameless');
      // draggable area
      document
        .querySelector('.notion-topbar')
        .prepend(helpers.createElement('<div class="window-dragarea"></div>'));
      document.documentElement.style.setProperty(
        '--configured--dragarea_height',
        `${store().dragarea_height + 2}px`
      );
    }

    // window buttons
    if (!tabsEnabled) {
      const buttons = require('./buttons.js')(store);
      document
        .querySelector('.notion-topbar > div[style*="display: flex"]')
        .appendChild(buttons.element);
    }
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

    // external theming
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

    function setThemeVars() {
      electron.ipcRenderer.send(
        'enhancer:set-menu-theme',
        [
          '--theme--main',
          '--theme--sidebar',
          '--theme--overlay',
          '--theme--dragarea',
          '--theme--box-shadow_strong',
          '--theme--font_sans',
          '--theme--font_code',
          '--theme--font_label-size',
          '--theme--scrollbar',
          '--theme--scrollbar-border',
          '--theme--scrollbar_hover',
          '--theme--card',
          '--theme--table-border',
          '--theme--interactive_hover',
          '--theme--interactive_hover-border',
          '--theme--button_close',
          '--theme--button_close-fill',
          '--theme--selected',
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
          '--theme--line_yellow-text',
          '--theme--line_green',
          '--theme--line_green-text',
          '--theme--line_blue',
          '--theme--line_blue-text',
          '--theme--line_red',
          '--theme--line_red-text',
          '--theme--code_inline-text',
          '--theme--code_inline-background',
        ].map((rule) => [rule, getStyle(rule)])
      );
      if (tabsEnabled) {
        electron.ipcRenderer.sendToHost(
          'enhancer:set-tab-theme',
          [
            '--theme--main',
            '--theme--dragarea',
            '--theme--font_sans',
            '--theme--table-border',
            '--theme--interactive_hover',
            '--theme--interactive_hover-border',
            '--theme--button_close',
            '--theme--button_close-fill',
            '--theme--option_active-background',
            '--theme--selected',
            '--theme--text',
          ].map((rule) => [rule, getStyle(rule)])
        );
      }
    }
    setThemeVars();
    new MutationObserver(setThemeVars).observe(
      document.querySelector('.notion-app-inner'),
      { attributes: true }
    );
    electron.ipcRenderer.on('enhancer:get-menu-theme', setThemeVars);

    if (tabsEnabled) {
      let tab_title = '';
      __electronApi.setWindowTitle = (title) => {
        if (tab_title !== title) {
          tab_title = title;
          electron.ipcRenderer.sendToHost('enhancer:set-tab-title', title);
        }
      };
      __electronApi.openInNewWindow = (urlPath) => {
        electron.ipcRenderer.sendToHost(
          'enhancer:new-tab',
          `notion://www.notion.so${urlPath}`
        );
      };
    } else if (store().frameless && !store().tiling_mode) {
      let sidebar_width;
      function setSidebarWidth(list) {
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
      new MutationObserver(setSidebarWidth).observe(
        document.querySelector('.notion-sidebar'),
        { attributes: true }
      );
      setSidebarWidth([{ target: document.querySelector('.notion-sidebar') }]);
    }
  }
};
