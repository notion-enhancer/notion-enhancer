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
  desc: 'directly link files for small client-side tweaks.',
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
};
