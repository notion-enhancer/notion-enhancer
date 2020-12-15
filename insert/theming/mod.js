/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

module.exports = {
  forced: true,
  hidden: true,
  id: '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  name: 'theming',
  tags: ['core', 'theme'],
  desc: 'loads & applies the theming variables and other css inserts.',
  version: require('../package.json').version,
  authors: [
    {
      name: 'dragonwocky',
      link: 'https://dragonwocky.me/',
      avatar: 'https://dragonwocky.me/avatar.jpg',
    },
  ],
  hacks: {
    'renderer/preload.js': (
      __exports,
      store,
      { web: { whenReady, loadStyleset } }
    ) => {
      whenReady(() => {
        loadStyleset('global');
        loadStyleset('app');
      });
    },
  },
};
