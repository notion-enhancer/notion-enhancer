/**
 * notion-enhancer: scroll to top
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { FloatingButton } from "../../core/islands/FloatingButton.mjs";

export default async (api, db) => {
  const { html, addFloatingButton, removeFloatingButton } = api,
    { addMutationListener, removeMutationListener } = api,
    distanceUntilShown = await db.get("distanceScrolledUntilShown"),
    scrollUnits = await db.get("scrollDistanceUnits"),
    behavior = (await db.get("smoothScrolling")) ? "smooth" : "auto",
    scroller = ".notion-frame > .notion-scroller";

  let $scroller;
  const $btn = html`<${FloatingButton}
      onclick=${() => $scroller?.scroll({ top: 0, left: 0, behavior })}
      aria-label="Scroll to top"
      ><i class="i-chevrons-up" />
    <//>`,
    onScroll = () => {
      if (!$scroller) return;
      const { scrollTop, scrollHeight, clientHeight } = $scroller,
        scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100,
        scrollDist = scrollUnits === "Percent" ? scrollPercent : scrollTop;
      if (distanceUntilShown <= scrollDist) addFloatingButton($btn);
      else removeFloatingButton($btn);
    },
    setup = () => {
      if (document.contains($scroller)) return;
      $scroller = document.querySelector(scroller);
      $scroller?.removeEventListener("scroll", onScroll);
      $scroller?.addEventListener("scroll", onScroll);
      onScroll();
    };
  addMutationListener(scroller, setup, true);
  setup();
};
