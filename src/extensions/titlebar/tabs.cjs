/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({ whenReady }, db) => {
  const api = await whenReady(),
    { addMutationListener } = api,
    tabSelector = ".hide-scrollbar > div > div",
    titlebarStyle = await db.get("titlebarStyle");

  // only make area draggable if tabs are visible:
  // otherwise dragarea overlaps regular app topbar
  addMutationListener(".hide-scrollbar", () => {
    const tabCount = document.querySelectorAll(tabSelector).length;
    if (tabCount > 1) document.body.classList.add("notion-tabs");
    else document.body.classList.remove("notion-tabs");
  });

  if (titlebarStyle === "Disabled") return;
};
