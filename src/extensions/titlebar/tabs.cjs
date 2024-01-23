/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({ whenReady }, db) => {
  const api = await whenReady(),
    { html, addMutationListener } = api,
    { enhancerUrl, onMessage, sendMessage } = api,
    titlebarStyle = await db.get("titlebarStyle");

  // only make area draggable if tabs are visible:
  // otherwise dragarea overlaps regular app topbar
  const tabSelector = ".hide-scrollbar > div > div";
  addMutationListener(".hide-scrollbar", () => {
    const tabCount = document.querySelectorAll(tabSelector).length;
    if (tabCount > 1) document.body.classList.add("notion-tabs");
    else document.body.classList.remove("notion-tabs");
  });

  onMessage("tabs:set-state", (state) => {
    if (state.themeMode === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  });

  if (titlebarStyle === "Disabled") return;
  const $buttonsScript = document.createElement("script");
  $buttonsScript.type = "module";
  $buttonsScript.src = enhancerUrl("extensions/titlebar/buttons.mjs");
  document.head.append($buttonsScript);
};
