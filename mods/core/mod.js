/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

module.exports = {
  id: '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  tags: ['core', 'extension'],
  name: 'notion-enhancer core',
  desc: `> the **modloader** itself, _including_: the [CLI](https://github.com), the \`menu\`, and ~~enabling/disabling/insertion/updating of~~ mods.
    ![](https://preview.redd.it/vtiw9ulqlt951.png?width=1368&format=png&auto=webp&s=733d8b27ec62151c7858b4eca463f809ead6395a)`,
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
      label: 'integrate titlebar into notion',
      type: 'toggle',
      value: true,
    },
    {
      key: 'dragarea_height',
      label: 'height of frameless dragarea',
      type: 'input',
      value: 15,
    },
    {
      key: 'smooth_scrollbars',
      label: 'integrate scrollbars into notion',
      type: 'toggle',
      value: true,
    },
    {
      key: 'hotkey',
      label: 'window display hotkey',
      type: 'input',
      value: 'CmdOrCtrl+Shift+A',
    },
  ],
  hacks: {
    'main/main.js': require('./tray.js'),
    'main/createWindow.js': require('./create.js'),
    'renderer/index.js': require('./render.js'),
    'renderer/preload.js': require('./client.js'),
  },
};
