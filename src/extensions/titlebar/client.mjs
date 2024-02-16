/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { createWindowButtons } from "./buttons.mjs";

export default async (api, db) => {
  const titlebarStyle = await db.get("titlebarStyle");
  if (titlebarStyle === "Disabled") return;

  const { onMessage, addMutationListener, removeMutationListener } = api,
    $buttons = await createWindowButtons(),
    topbarMore = ".notion-topbar .notion-topbar-more-button",
    addToTopbar = () => {
      if (document.contains($buttons)) removeMutationListener(addToTopbar);
      document.querySelector(topbarMore)?.after($buttons);
    },
    showIfNoTabBar = async () => {
      const { isShowingTabBar } = await __electronApi.electronAppFeatures.get();
      $buttons.style.display = isShowingTabBar ? "none" : "";
    };
  __electronApi?.electronAppFeatures.addListener(showIfNoTabBar);
  showIfNoTabBar();
  addMutationListener(topbarMore, addToTopbar);
  addToTopbar(topbarMore);
};
