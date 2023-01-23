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
    h-[${variant === "sm" ? "28" : "32"}px] transition
    duration-[20ms] ${
      variant === "primary"
        ? `text-[color:var(--theme--accent-primary\\_contrast)]
           font-medium bg-[color:var(--theme--accent-primary)]
           hover:bg-[color:var(--theme--accent-primary\\_hover)]`
        : variant === "secondary"
        ? `text-[color:var(--theme--accent-secondary)]
           border-(& [color:var(--theme--accent-secondary)])
           hover:bg-[color:var(--theme--accent-secondary\\_hover)]`
        : `border-(& [color:var(--theme--fg-border)])
           hover:bg-[color:var(--theme--bg-hover)]`
    }`,
  });
  return html`<${tagName ?? "button"} tabindex="0" ...${props}>
    ${icon
      ? html`<i
          class="i-${icon}
          text-[${variant === "sm" && children.length ? "14" : "18"}px]"
        ></i>`
      : ""}
    <span class="text-[${variant === "sm" ? "13" : "14"}px] empty:hidden">
      ${children}
    </span>
  <//>`;
}

export { Button };
