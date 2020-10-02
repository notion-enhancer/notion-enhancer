/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  tags: ['core'],
  name: 'notion-enhancer core',
  desc: 'the cli, modloader, menu, & tray.',
  version: require('../../package.json').version,
  author: 'dragonwocky',
  options: [
    {
      key: 'openhidden',
      label: 'hide app on open',
      type: 'toggle',
      value: false,
    },
    {
      key: 'maximized',
      label: 'auto-maximise windows',
      type: 'toggle',
      value: false,
    },
    {
      key: 'close_to_tray',
      label: 'close window to the tray',
      type: 'toggle',
      value: true,
    },
    {
      key: 'frameless',
      label: 'integrated titlebar',
      type: 'toggle',
      value: true,
    },
    {
      key: 'dragarea_height',
      label: 'height of frameless dragarea:',
      type: 'input',
      value: 15,
    },
    {
      key: 'tiling_mode',
      label: 'tiling window manager mode',
      type: 'toggle',
      value: false,
    },
    {
      key: 'smooth_scrollbars',
      label: 'integrated scrollbars',
      type: 'toggle',
      value: true,
    },
    {
      key: 'snappy_transitions',
      label: 'snappy transitions',
      type: 'toggle',
      value: false,
    },
    {
      key: 'hotkey',
      label: 'window display hotkey:',
      type: 'input',
      value: 'CommandOrControl+Shift+A',
    },
    {
      key: 'menu_toggle',
      label: 'open enhancements menu hotkey:',
      type: 'input',
      value: 'Alt+E',
    },
  ],
  hacks: {
    'main/main.js': require('./tray.js'),
    'main/createWindow.js': require('./create.js'),
    'renderer/index.js': require('./render.js'),
    'renderer/preload.js': require('./client.js'),
  },
};
