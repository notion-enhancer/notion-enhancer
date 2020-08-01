/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

const __mod = require('./mod.js'),
  store = require('../../pkg/store.js'),
  settings = store(__mod.id, __mod.defaults),
  electron = require('electron');

window['__start'] = async () => {
  const buttons = require('./buttons.js');
  document.querySelector('#menu-titlebar').appendChild(buttons.element);

  electron.ipcRenderer.on('enhancer:set-theme', (event, theme) => {
    document.body.className = `notion-${theme.mode}-theme smooth-scrollbars`;
    for (const style of theme.rules)
      document.body.style.setProperty(style[0], style[1]);
  });
};
