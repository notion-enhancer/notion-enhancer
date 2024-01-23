/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({}, db) => {
  const titlebarStyle = await db.get("titlebarStyle");
  Object.assign((globalThis.__notionConfig ??= {}), {
    titlebarStyle: "hidden",
  });
};
