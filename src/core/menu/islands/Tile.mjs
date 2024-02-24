/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Tile({ icon, title, tagName, ...props }, ...children) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `flex items-center gap-[12px] rounded-[4px]
    border-(~ [color:var(--theme--fg-border)]) px-[16px]
    bg-[color:var(--theme--bg-secondary)] py-[12px]
    hover:bg-[color:var(--theme--bg-hover)]`,
  });
  tagName ??= props["href"] ? "a" : "button";
  return html`<${tagName} ...${props}>
    <i class="i-${icon} text-[28px]"></i>
    <div>
      <h3 class="text-[14px] font-semibold">${title}</h3>
      <div class="text-([12px] [color:var(--theme--fg-secondary)])">
        ${children}
      </div>
    </div>
  <//>`;
}

export { Tile };
