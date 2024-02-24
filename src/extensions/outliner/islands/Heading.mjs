/**
 * notion-enhancer: outliner
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Heading({ indent, ...props }, ...children) {
  const { html } = globalThis.__enhancerApi;
  return html`<div
    role="button"
    class="notion-enhancer--outliner-heading block
    relative cursor-pointer select-none text-[14px]
    decoration-(2 [color:var(--theme--fg-border)])
    hover:bg-[color:var(--theme--bg-hover)]
    py-[6px] pr-[2px] pl-[${indent * 18}px]
    underline-(~ offset-4) last:mb-[24px]"
    ...${props}
  >
    ${children}
  </div>`;
}

export { Heading };
