/*
 * font chooser
 * (c) 2020 torchatlas (https://bit.ly/torchatlas)
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 admiraldus (https://github.com/admiraldus)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'e0d8d148-45e7-4d79-8313-e7b2ad8abe16',
  tags: ['extension'],
  name: 'font chooser',
  desc:
    'customize fonts. for each option, type in the name of the font you would like to use, or leave it blank to not change anything.<br/><br/>make sure the fonts you type are installed on your device.',
  version: '0.2.1',
  author: 'torchatlas',
  options: [
    {
      key: 'sans',
      label: 'sans-serif (inc. ui):',
      type: 'input',
      value: '',
    },
    {
      key: 'serif',
      label: 'serif:',
      type: 'input',
      value: '',
    },
    {
      key: 'mono',
      label: 'monospace:',
      type: 'input',
      value: '',
    },
    {
      key: 'code',
      label: 'code:',
      type: 'input',
      value: '',
    },
    {
      key: 'quote',
      label: 'quote:',
      type: 'input',
      value: '',
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const attempt_interval = setInterval(enhance, 500);
      async function enhance() {
        if (!document.querySelector('.notion-app-inner')) return;
        clearInterval(attempt_interval);
        for (let style of ['sans', 'serif', 'mono', 'code', 'quote']) {
          if (!store()[style]) continue;
          document
            .querySelector('.notion-app-inner')
            .style.setProperty(`--theme--font_${style}`, store()[style]);
        }
      }
    },
  },
};
