/*
 * dark+
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'c86cfe98-e645-4822-aa6b-e2de1e08bafa',
  tags: ['theme', 'dark'],
  name: 'dark+',
  desc: 'a vivid-colour near-black theme.',
  version: '0.1.5',
  author: 'dragonwocky',
  options: [
    {
      key: 'primary',
      label: 'primary colour',
      type: 'color',
      value: 'rgb(177, 24, 24)',
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const color = require('./one-color.js')(store().primary);
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        document.documentElement.style.setProperty(
          '--theme_dark--selected',
          color.lightness(0.35).alpha(0.2).cssa()
        );
        document.documentElement.style.setProperty(
          '--theme_dark--primary',
          color.hex()
        );
        document.documentElement.style.setProperty(
          '--theme_dark--primary_hover',
          color.lightness(0.5).hex()
        );
        document.documentElement.style.setProperty(
          '--theme_dark--primary_click',
          color.lightness(0.6).hex()
        );
        document.documentElement.style.setProperty(
          '--theme_dark--primary_indicator',
          color.lightness(0.4).hex()
        );
      });
    },
  },
};
