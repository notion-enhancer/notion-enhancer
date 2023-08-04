/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Tooltip(props, ...children) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    role: "dialog",
    class: `absolute group z-[999] pointer-events-none`,
  });

  const notionApp = ".notion-app-inner",
    $tooltip = html`<div ...${props}>
      <div
        class="bg-[color:var(--theme--bg-secondary)]
        text-([color:var(--theme--fg-secondary)] [12px] center)
        leading-[1.4] font-medium py-[4px] px-[8px] rounded-[4px]
        drop-shadow-md transition duration-200 opacity-0
        group-open:(pointer-events-auto opacity-100)
        children:text-([color:var(--theme--fg-primary)]"
      >
        ${children}
      </div>
    </div>`;
  $tooltip.show = (x, y) => {
    const $notionApp = document.querySelector(notionApp);
    if (!document.contains($tooltip)) $notionApp?.append($tooltip);
    requestAnimationFrame(() => {
      $tooltip.setAttribute("open", true);
      x -= $tooltip.clientWidth + 6;
      if (x < 0) x += $tooltip.clientWidth + 12;
      y -= $tooltip.clientHeight / 2;
      if (y < 0) y += $tooltip.clientHeight / 2;
      $tooltip.style.left = `${x}px`;
      $tooltip.style.top = `${y}px`;
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

  return $tooltip;
}

export { Tooltip };
