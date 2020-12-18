/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

module.exports = {
  forced: true,
  hidden: true,
  id: '30a382b0-42e1-4a00-8c9d-7b2d9886a09a',
  name: 'notion-enhancer core',
  version: require('../package.json').version,
  authors: [
    {
      name: 'dragonwocky',
      link: 'https://dragonwocky.me/',
      avatar: 'https://dragonwocky.me/avatar.jpg',
    },
  ],
  options: [
    {
      key: 'menu.autoresolve',
      label: '**menu:** auto-resolve theme conflicts',
      desc:
        'enabling a theme will disable any other themes of the same mode (light/dark).',
      type: 'toggle',
      value: false,
    },
    {
      key: 'openhidden',
      label: 'hide app on open',
      desc:
        'app can be made visible by clicking the tray icon or using the hotkey.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'maximized',
      label: 'auto-maximise windows',
      desc:
        'whenever a window is un-hidden or is created it will be maximised.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'close_to_tray',
      label: 'close window to the tray',
      desc: `pressing the × close button will hide the app instead of quitting it.\
        it can be re-shown by clicking the tray icon or using the hotkey.`,
      type: 'toggle',
      value: true,
      platformOverwrite: {
        darwin: true,
      },
    },
    {
      key: 'hotkey',
      label: '**hotkey:** toggle all windows',
      desc: 'used to hide/show all app windows.',
      type: 'input',
      value: 'CommandOrControl+Shift+A',
    },
    {
      key: 'menu_toggle',
      label: '**hotkey:** toggle enhancements menu',
      desc: 'used to open/close the menu while notion is focused.',
      type: 'input',
      value: 'Alt+E',
    },
  ],
  hacks: {
    'renderer/preload.js': (
      __exports,
      store,
      { web: { whenReady, loadStyleset } }
    ) => {
      whenReady(() => {
        // document.defaultView.addEventListener('keyup', (event) => {
        //   // additional hotkeys
        //   if (event.key === 'F5') location.reload();
        //   // open menu on hotkey toggle
        //   if (store().get().menu_toggle) {
        //     const hotkey = {
        //       ctrlKey: false,
        //       metaKey: false,
        //       altKey: false,
        //       shiftKey: false,
        //       ...toKeyEvent(store().menu_toggle),
        //     };
        //     let triggered = true;
        //     for (let prop in hotkey)
        //       if (
        //         hotkey[prop] !== event[prop] &&
        //         !(prop === 'key' && event[prop] === 'Dead')
        //       )
        //         triggered = false;
        //     if (triggered) electron.ipcRenderer.send('enhancer:open-menu');
        //   }
        // });
      });
    },
  },
};
