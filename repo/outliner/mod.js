/*
 * outliner
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const store = require("../../pkg/store");

module.exports = {
  id: '87e077cc-5402-451c-ac70-27cc4ae65546',
  tags: ['extension', 'panel'],
  name: 'outliner',
  desc: 'table of contents.',
  version: '1.1.1',
  author: 'CloudHill',
  options: [
    {
      key: 'lined',
      label: 'indentation lines',
      type: 'toggle',
      value: true
    },
    {
      key: 'fullHeight',
      label: 'full height',
      type: 'toggle',
      value: false
    }
  ],
  panel: {
    html: "panel.html",
    name: "Outline",
    icon: "icon.svg",
    js: "panel.js",
    fullHeight: store('87e077cc-5402-451c-ac70-27cc4ae65546').fullHeight
  }
};
