/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { extendProps } from "../state.mjs";

function Button({ icon, variant, tagName, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-button shrink-0
    flex gap-[8px] items-center px-[12px] rounded-[4px]
    h-[${variant === "sm" ? "28" : "32"}px] select-none
    transition duration-[20ms] ${
      variant === "primary"
        ? `text-[color:var(--theme--accent-primary\\_contrast)]
           font-medium bg-[color:var(--theme--accent-primary)]
           hover:bg-[color:var(--theme--accent-primary\\_hover)]`
        : variant === "secondary"
        ? `text-[color:var(--theme--accent-secondary)]
           border-(& [color:var(--theme--accent-secondary)])
           hover:bg-[color:var(--theme--accent-secondary\\_hover)]`
        : variant === "brand"
        ? `text-white border-(& purple-400)
           bg-purple-500 hover:(from-white/20 to-transparent
           bg-[linear-gradient(225deg,var(--tw-gradient-stops))])`
        : `border-(& [color:var(--theme--fg-border)])
           not-disabled:hover:bg-[color:var(--theme--bg-hover)]
           disabled:text-[color:var(--theme--fg-secondary)]`
    }`,
  });
  tagName ??= props["href"] ? "a" : "button";
  return html`<${tagName} ...${props}>
    ${icon
      ? html`<i
          class="i-${icon}
          text-[${variant === "sm" && children.length ? "13" : "17"}px]"
        ></i>`
      : ""}
    <span class="text-[${variant === "sm" ? "13" : "14"}px] empty:hidden">
      ${children}
    </span>
  <//>`;
}

export { Button };
