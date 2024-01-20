/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

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
  $tooltip.show = (x, y) => {
    const $notionApp = document.querySelector(notionApp);
    if (!document.contains($tooltip)) $notionApp?.append($tooltip);
    if ($tooltip.hasAttribute("open")) return;
    requestAnimationFrame(() => {
      $tooltip.onbeforeshow?.();
      $tooltip.setAttribute("open", true);
      x -= $tooltip.clientWidth;
      if (x < 0) x = $tooltip.clientWidth + 12;
      y -= $tooltip.clientHeight / 2;
      if (y < 0) y = $tooltip.clientHeight + 12;
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
  $tooltip.attach = ($target, calcPos) => {
    $target.addEventListener("mouseover", (event) => {
      setTimeout(() => {
        if (!$target.matches(":hover")) return;
        const { x = event.clientX, y = event.clientY } = calcPos?.(event) ?? {};
        $tooltip.show(x, y);
      }, 200);
    });
    $target.addEventListener("mouseout", $tooltip.hide);
  };

  return $tooltip;
}

export { Tooltip };
