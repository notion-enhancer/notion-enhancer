/**
 * notion-enhancer: scroll to top
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

export default async (api, db) => {
  const { html } = api,
    behavior = (await db.get("smoothScrolling")) ? "smooth" : "auto",
    scroller = ".notion-frame > .notion-scroller";

  const $btn = html`<button
    aria-label="Scroll to top"
    class="z-50 flex items-center justify-center absolute rounded-full
    text-([20px] [color:var(--theme--fg-primary)]) select-none cursor-pointer
    bg-[color:var(--theme--bg-secondary)] hover:bg-[color:var(--theme--bg-hover)]
    bottom-[calc(26px+env(safe-area-inset-bottom))] right-[74px] w-[36px] h-[36px]"
    style="box-shadow: rgba(15, 15, 15, 0.2) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 2px 4px;"
    onclick=${() => {
      const $scroller = document.querySelector(scroller);
      $scroller.scroll({ top: 0, left: 0, behavior });
    }}
  >
    <i class="i-chevrons-up" />
  </button>`;
  document.body.append($btn);

  // const topDistancePx = +(await db.get(["top_distance_px"])),
  //   topDistancePercent = 0.01 * (await db.get(["top_distance_percent"])),
  //   adjustButtonVisibility = async () => {
  //     if (!$scroller) return;
  //     $scrollButton.classList.add("hidden");
  //     const scrolledDistance =
  //       $scroller.scrollTop >= topDistancePx ||
  //       $scroller.scrollTop >=
  //         ($scroller.scrollHeight - $scroller.clientHeight) *
  //           topDistancePercent;
  //     if (scrolledDistance) $scrollButton.classList.remove("hidden");
  //   };
  // web.addDocumentObserver(() => {
  //   $scroller = document.querySelector(".notion-frame > .notion-scroller");
  //   $scroller.removeEventListener("scroll", adjustButtonVisibility);
  //   $scroller.addEventListener("scroll", adjustButtonVisibility);
  // }, [".notion-frame > .notion-scroller"]);
  // adjustButtonVisibility();
  // if (topDistancePx && topDistancePercent)
  //   $scrollButton.classList.add("hidden");
};
