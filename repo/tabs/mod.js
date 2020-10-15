/*
 * tabs
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

// this is just a pseudo mod to "separate" the options
// from the core module - the core still handles actually
// making it work.
module.exports = {
  id: 'e1692c29-475e-437b-b7ff-3eee872e1a42',
  tags: ['core', 'extension'],
  name: 'tabs',
  desc: 'have multiple notion pages open in a single window.',
  version: '0.1.0',
  author: 'dragonwocky',
  options: [
    {
      key: 'select_modifier',
      label:
        'tab select modifier (key+1, +2, +3, ... +9 and key+left/right arrows):',
      type: 'select',
      value: [
        'Alt',
        'Command',
        'Control',
        'Super',
        'Alt+Shift',
        'Command+Shift',
        'Control+Shift',
        'Super+Shift',
      ],
    },
    {
      key: 'new_tab',
      label: 'new tab keybinding:',
      type: 'input',
      value: 'CommandOrControl+T',
    },
    {
      key: 'close_tab',
      label: 'close tab keybinding:',
      type: 'input',
      value: 'CommandOrControl+W',
    },
  ],
};
