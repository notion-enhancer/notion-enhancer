/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = (store) => {
  const helpers = require('../../pkg/helpers.js'),
    path = require('path'),
    fs = require('fs-extra'),
    browser = require('electron').remote.getCurrentWindow(),
    is_mac = process.platform === 'darwin',
    buttons = {
      element: helpers.createElement('<div class="window-buttons-area"></div>'),
      insert: [
        ...((store('mods', {})['72886371-dada-49a7-9afc-9f275ecf29d3'] || {})
          .enabled
          ? ['alwaysontop']
          : []),
        ...(store().frameless && !store().tiling_mode && !is_mac
          ? ['minimize', 'maximize', 'close']
          : []),
      ],
      icons: {
        raw: {
          alwaysontop: {
            on: fs.readFile(
              path.resolve(`${__dirname}/icons/alwaysontop_on.svg`)
            ),
            off: fs.readFile(
              path.resolve(`${__dirname}/icons/alwaysontop_off.svg`)
            ),
          },
          minimize: fs.readFile(
            path.resolve(`${__dirname}/icons/minimize.svg`)
          ),
          maximize: {
            on: fs.readFile(path.resolve(`${__dirname}/icons/maximize_on.svg`)),
            off: fs.readFile(
              path.resolve(`${__dirname}/icons/maximize_off.svg`)
            ),
          },
          close: fs.readFile(path.resolve(`${__dirname}/icons/close.svg`)),
        },
        alwaysontop() {
          return browser.isAlwaysOnTop()
            ? buttons.icons.raw.alwaysontop.on
            : buttons.icons.raw.alwaysontop.off; // '🠙' : '🠛'
        },
        minimize() {
          return buttons.icons.raw.minimize; // '⚊'
        },
        maximize() {
          return browser.isMaximized()
            ? buttons.icons.raw.maximize.on
            : buttons.icons.raw.maximize.off; // '🗗' : '🗖'
        },
        close() {
          return buttons.icons.raw.close; // '⨉'
        },
      },
      actions: {
        async alwaysontop() {
          browser.setAlwaysOnTop(!browser.isAlwaysOnTop());
          this.innerHTML = await buttons.icons.alwaysontop();
        },
        minimize() {
          browser.minimize();
        },
        async maximize() {
          browser.isMaximized() ? browser.unmaximize() : browser.maximize();
          this.innerHTML = await buttons.icons.maximize();
        },
        close() {
          browser.close();
        },
      },
    };

  (async () => {
    for (let btn of buttons.insert) {
      buttons.element.innerHTML += `<button class="window-button" id="btn-${btn}">${await buttons.icons[
        btn
      ]()}</button>`;
    }
    for (let btn of buttons.insert) {
      document.querySelector(`.window-button#btn-${btn}`).onclick =
        buttons.actions[btn];
    }
    if (store().frameless && !store().tiling_mode && !is_mac) {
      window.addEventListener('resize', (event) => {
        Promise.resolve(buttons.icons.maximize()).then((icon) => {
          icon = icon.toString();
          const el = buttons.element.querySelector('#btn-maximize');
          if (el.innerHTML != icon) el.innerHTML = icon;
        });
      });
    }
  })();

  return buttons;
};
