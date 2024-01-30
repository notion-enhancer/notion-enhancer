/**
 * notion-enhancer
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function TopbarButton({ icon, ...props }, ...children) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    tabindex: 0,
    class: `notion-enhancer--topbar-button
    text-[color:var(--theme--fg-primary)] mr-[2px]
    select-none h-[28px] w-[33px] duration-[20ms]
    transition inline-flex items-center justify-center
    rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]
    has-[span]:w-auto &>span:(text-[14px] leading-[1.2] px-[8px])
    &[data-active]:bg-[color:var(--theme--bg-hover)]
    &>i:size-[20px]`,
  });

  return html`<button ...${props}>
    ${props.innerHTML || children.length
      ? children
      : html`<i class="i-${icon}" />`}
  </button>`;
}

export { TopbarButton };
