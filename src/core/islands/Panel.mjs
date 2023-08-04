/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Panel(props) {
  const { html, extendProps } = globalThis.__enhancerApi;
  return html`<iframe ...${props}></iframe>`;
}

export { Panel };
