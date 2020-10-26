/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  alwaysActive: true,
  tags: ['core'],
  name: 'notion-enhancer core',
  desc: 'the cli, modloader, menu, & tray.',
  version: require('../../package.json').version,
  author: 'dragonwocky',
  options: [
    {
      key: 'autoresolve',
      label: 'auto-resolve theme conflicts',
      description:
        'when a theme is enabled any other themes of the same mode (light/dark) will be disabled.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'openhidden',
      label: 'hide app on open',
      description:
        'app can be made visible by clicking the tray icon or using the hotkey.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'maximized',
      label: 'auto-maximise windows',
      description:
        'whenever a window is un-hidden or is created it will be maximised.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'close_to_tray',
      label: 'close window to the tray',
      description: `pressing the × close button will hide the app instead of quitting it.
        it can be re-shown by clicking the tray icon or using the hotkey.`,
      type: 'toggle',
      value: true,
    },
    {
      key: 'frameless',
      label: 'integrated titlebar',
      description: `replace the native titlebar with buttons inset into the app.`,
      type: 'toggle',
      value: true,
    },
    {
      key: 'tiling_mode',
      label: 'tiling window manager mode',
      description: `completely remove the close/minimise/maximise buttons -
        this is for a special type of window manager. if you don't understand it, don't use it.`,
      type: 'toggle',
      value: false,
    },
    {
      key: 'hotkey',
      label: 'window display hotkey:',
      description: 'used to toggle hiding/showing all app windows.',
      type: 'input',
      value: 'CommandOrControl+Shift+A',
    },
    {
      key: 'menu_toggle',
      label: 'open enhancements menu hotkey:',
      description:
        'used to toggle opening/closing this menu while notion is focused.',
      type: 'input',
      value: 'Alt+E',
    },
    {
      key: 'default_page',
      label: 'default page id/url:',
      description: `every new tab/window that isn't opening a url via the notion://
        protocol will load this page. to get a page link from within the app,
        go to the triple-dot menu and click "copy link".
        leave blank to just load the last page you opened.`,
      type: 'input',
      value: '',
    },
  ],
  hacks: {
    'main/main.js': require('./tray.js'),
    'main/systemMenu.js': require('./systemMenu.js'),
    'main/createWindow.js': require('./createWindow.js'),
    'renderer/index.js': require('./render.js'),
    'renderer/preload.js': require('./client.js'),
  },
};
