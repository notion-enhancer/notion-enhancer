/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function Tooltip(props, ...children) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    role: "dialog",
    class: `absolute group/tooltip z-[999] text-center pointer-events-none`,
  });

  const notionApp = ".notion-app-inner",
    $tooltip = html`<div ...${props}>
      <div
        class="bg-[color:var(--theme--bg-secondary)]
        text-([color:var(--theme--fg-secondary)] [12px] nowrap)
        leading-[1.4] font-medium py-[4px] px-[8px] rounded-[4px]
        drop-shadow-md transition duration-100 opacity-0
        group-open/tooltip:(pointer-events-auto opacity-100)
        &>b:text-[color:var(--theme--fg-primary)]"
      >
        ${children}
      </div>
    </div>`;
  // can pass each coord as a number or a function
  $tooltip.show = (x, y) => {
    const $notionApp = document.querySelector(notionApp);
    if (!document.contains($tooltip)) $notionApp?.append($tooltip);
    if ($tooltip.hasAttribute("open")) return;
    $tooltip.onbeforeshow?.();
    const edgePadding = 12,
      { clientHeight, clientWidth } = document.documentElement;
    requestAnimationFrame(() => {
      if (typeof x === "function") x = x();
      if (typeof y === "function") y = y();
      if (x < edgePadding) x = $tooltip.clientWidth + edgePadding;
      if (x + $tooltip.clientWidth > clientWidth - edgePadding)
        x = clientWidth - $tooltip.clientWidth - edgePadding;
      if (y < edgePadding) y = $tooltip.clientHeight + edgePadding;
      if (y + $tooltip.clientHeight > clientHeight - edgePadding)
        y = clientHeight - $tooltip.clientHeight - edgePadding;
      $tooltip.style.left = `${x}px`;
      $tooltip.style.top = `${y}px`;
      $tooltip.setAttribute("open", true);
      $tooltip.onshow?.();
    });
  };
  $tooltip.hide = () => {
    $tooltip.onbeforehide?.();
    $tooltip.removeAttribute("open");
    setTimeout(() => {
      $tooltip.onhide?.();
    }, 200);
  };
  $tooltip.attach = ($target, alignment = "") => {
    $target.addEventListener("mouseover", (event) => {
      setTimeout(() => {
        if (!$target.matches(":hover")) return;
        const x = () => {
            const rect = $target.getBoundingClientRect();
            if (["top", "bottom"].includes(alignment)) {
              return rect.left + rect.width / 2 - $tooltip.clientWidth / 2;
            } else if (alignment === "left") {
              return rect.left - $tooltip.clientWidth - 6;
            } else if (alignment === "right") {
              return rect.right + 6;
            } else return event.clientX;
          },
          y = () => {
            const rect = $target.getBoundingClientRect();
            if (["left", "right"].includes(alignment)) {
              return event.clientY - $tooltip.clientHeight / 2;
            } else if (alignment === "top") {
              return rect.top - $tooltip.clientHeight - 6;
            } else if (alignment === "bottom") {
              return rect.bottom + 6;
            } else return event.clientY;
          };
        $tooltip.show(x, y);
      }, 200);
    });
    $target.addEventListener("mouseout", $tooltip.hide);
  };

  return $tooltip;
}

export { Tooltip };
