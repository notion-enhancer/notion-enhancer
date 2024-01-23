/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { createWindowButtons } from "./buttons.mjs";

export default (api, db) => {
  const { onMessage, addMutationListener } = api,
    $buttons = createWindowButtons(),
    topbarMore = ".notion-topbar-more-button",
    addToTopbar = () => document.querySelector(topbarMore)?.after($buttons),
    showIfNoTabBar = async () => {
      const { isShowingTabBar } = await __electronApi.electronAppFeatures.get();
      $buttons.style.display = isShowingTabBar ? "none" : "";
    };
  __electronApi?.electronAppFeatures.addListener(showIfNoTabBar);
  showIfNoTabBar();
  addMutationListener(topbarMore, addToTopbar);
  addToTopbar(topbarMore);
};
