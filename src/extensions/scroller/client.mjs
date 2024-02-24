/**
 * notion-enhancer: scroll to top
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { FloatingButton } from "../../core/islands/FloatingButton.mjs";

export default async (api, db) => {
  const { html, addFloatingButton, removeFloatingButton } = api,
    { addMutationListener, removeMutationListener } = api,
    showScrollToBottom = await db.get("showScrollToBottom"),
    distanceUntilShown = await db.get("distanceUntilScrollToTopShown"),
    scrollUnits = await db.get("scrollDistanceUnits"),
    behavior = (await db.get("smoothScrolling")) ? "smooth" : "auto",
    scroller = ".notion-frame > .notion-scroller";

  let $scroller;
  const scrollTo = (top) => $scroller?.scroll({ top, behavior }),
    $scrollToBottom = html`<${FloatingButton}
      onclick="${() => scrollTo($scroller.scrollHeight)}"
      aria-label="Scroll to bottom"
      ><i class="i-chevrons-down" />
    <//>`,
    $scrollToTop = html`<${FloatingButton}
      onclick=${() => scrollTo(0)}
      aria-label="Scroll to top"
      ><i class="i-chevrons-up" />
    <//>`,
    onScroll = () => {
      if (!$scroller) return;
      const { scrollTop, scrollHeight, clientHeight } = $scroller;
      let scrollDist = scrollTop;
      if (scrollUnits === "Percent") {
        scrollDist = (scrollTop / (scrollHeight - clientHeight)) * 100;
        if (isNaN(scrollDist)) scrollDist = 0;
      }
      if (distanceUntilShown <= scrollDist) {
        if (document.contains($scrollToBottom))
          $scrollToBottom.replaceWith($scrollToTop);
        else addFloatingButton($scrollToTop);
      } else if (showScrollToBottom) {
        if (document.contains($scrollToTop))
          $scrollToTop.replaceWith($scrollToBottom);
        else addFloatingButton($scrollToBottom);
      } else removeFloatingButton($scrollToTop);
    },
    setup = () => {
      if (document.contains($scroller)) return;
      $scroller = document.querySelector(scroller);
      $scroller?.removeEventListener("scroll", onScroll);
      $scroller?.addEventListener("scroll", onScroll);
      onScroll();
    };
  addMutationListener(scroller, setup, { subtree: false });
  setup();
};
