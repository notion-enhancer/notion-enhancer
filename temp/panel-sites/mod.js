/*
 * panel sites
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '0d541743-eb2c-4d77-83a8-3b2f5e8e5dff',
  tags: ['extension', 'panel'],
  name: 'panel sites',
  desc: 'embed sites on the site panel.',
  version: '1.0.0',
  author: 'CloudHill',
  options: [
    {
      key: 'sites',
      label: 'list of sites',
      type: 'file',
      extensions: ['json'],
    },
  ],
  panel: {
    js: 'panel.js'
  }
};
