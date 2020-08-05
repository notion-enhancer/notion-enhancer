/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

module.exports = {
  id: 'b4b0aced-2059-43bf-8d1d-ccd757ee5ebb',
  tags: ['extension'],
  name: 'custom inserts',
  desc: 'link files for small client-side tweaks.',
  version: '0.0.2',
  author: 'dragonwocky',
  options: [
    {
      key: 'css',
      label: 'css insert',
      type: 'file',
      extensions: ['css'],
    },
    {
      key: 'js',
      label: 'client-side js insert',
      type: 'file',
      extensions: ['js'],
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const fs = require('fs-extra');
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        if (store().css) {
          try {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = fs.readFileSync(store().css);
            document.querySelector('head').appendChild(style);
          } catch (err) {
            console.warn('<custom-inserts> invalid css file... unsetting.');
            store().css = '';
          }
        }
        if (store().js) {
          try {
            require(store().js);
          } catch (err) {
            console.warn('<custom-inserts> invalid js file... unsetting.');
            store().js = '';
          }
        }
      });
    },
  },
};
