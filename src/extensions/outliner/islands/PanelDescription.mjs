/**
 * notion-enhancer: outliner
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function PanelDescription(props, ...children) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `py-[12px] px-[18px] text-(
    [13px] [color:var(--theme--fg-secondary)])`,
  });
  return html` <p ...${props}>${children}</p>`;
}

export { PanelDescription };
