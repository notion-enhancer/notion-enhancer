/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { extendProps } from "../state.mjs";

function Heading(props, ...children) {
  const { html } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-heading text-[16px]
    font-semibold mb-[16px] mt-[48px] first:mt-0 pb-[12px]
    border-b-(& [color:var(--theme--fg-border)])`,
  });
  return html`<h4 ...${props}>${children}</h4>`;
}

export { Heading };
