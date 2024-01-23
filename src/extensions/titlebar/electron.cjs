/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({}, db) => {
  Object.assign((globalThis.__notionConfig ??= {}), {
    titlebarStyle: "hidden",
  });
};
