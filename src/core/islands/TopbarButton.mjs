/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function TopbarButton({ icon, ...props }, ...children) {
  const { html, extendProps, addMutationListener } = globalThis.__enhancerApi;
  extendProps(props, {
    tabindex: 0,
    role: "button",
    class: `notion-enhancer--topbar-button
    text-[color:var(--theme--fg-primary)] mr-[2px]
    user-select-none h-[28px] w-[33px] duration-[20ms]
    transition inline-flex items-center justify-center
    rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]
    &[data-active]:bg-[color:var(--theme--bg-hover)]`,
  });

  return html`<button ...${props}>
    ${props.innerHTML || children.length
      ? children
      : html`<i class="i-${icon} w-[20px] h-[20px]" />`}
  </button>`;
}

export { TopbarButton };
