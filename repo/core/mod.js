/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

const defaults = {
  openhidden: false,
  maximized: false,
  close_to_tray: true,
  frameless: true,
  dragarea_height: 15,
  smooth_scrollbars: true,
  hotkey: 'CmdOrCtrl+Shift+A',
};

module.exports = {
  id: '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  tags: ['core', 'extension'],
  name: 'notion-enhancer core',
  desc: `the **modloader** itself, _including_: the [CLI](https://github.com), the \`menu\`, and ~~enabling/disabling/insertion/updating of~~ mods.
    ![](https://preview.redd.it/vtiw9ulqlt951.png?width=1368&format=png&auto=webp&s=733d8b27ec62151c7858b4eca463f809ead6395a)`,
  version: require('../../package.json').version,
  author: 'dragonwocky',
  options: [],
  hacks: {
    'main/main.js': require('./tray.js')(defaults),
    'main/createWindow.js': require('./create.js')(defaults),
    'renderer/index.js': require('./render.js')(defaults),
    'renderer/preload.js': require('./client.js')(defaults),
  },
  defaults,
};
