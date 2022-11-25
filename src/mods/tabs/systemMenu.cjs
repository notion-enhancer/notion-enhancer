/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({}, db, __exports, __eval) {
  const notionSetupSystemMenu = __exports.setupSystemMenu;
  __exports.setupSystemMenu = (locale) => {
    const { Menu } = require('electron'),
      template = notionSetupSystemMenu(locale);
    for (const category of template) {
      category.submenu = category.submenu.filter((item) => item.role !== 'close');
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    return template;
  };
};
