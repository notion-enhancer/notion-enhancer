/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { extendProps } from "../state.mjs";

function Description(props, ...children) {
  const { html } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-description typography
    leading-[16px] text-([12px] [color:var(--theme--fg-secondary)])`,
  });
  return html`<p ...${props}>${children}</p>`;
}

export { Description };
