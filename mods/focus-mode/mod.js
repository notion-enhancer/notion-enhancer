/*
 * focus mode
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 Arecsu
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '5a08598d-bfac-4167-9ae8-2bd0e2ef141e',
  tags: ['extension'],
  name: 'focus mode',
  desc:
    'hide the titlebar/menubar if the sidebar is closed (will be shown on hover).',
  version: '0.2.0',
  author: 'arecsu',
  options: [
    {
      key: 'padded',
      label: 'add padding to bottom of the page',
      description: `will only take effect when the sidebar is hidden. aims to make the canvas\
        as symmetrical/consistent as possible: if there is empty space on 3 sides, the 4th should follow.z`,
      type: 'toggle',
      value: true,
    },
  ],
  hacks: {
    'renderer/preload.js': (store, __exports) => {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        if (store().padded) document.body.dataset.focusmode = 'padded';
      });
    },
  },
};
