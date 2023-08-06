/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Description } from "./Description.mjs";
import { Toggle } from "./Toggle.mjs";

function Mod({
  id,
  name,
  version,
  description,
  thumbnail,
  tags = [],
  authors,
  options = [],
  _get,
  _set,
  _src,
}) {
  const { html, enhancerUrl, setState } = globalThis.__enhancerApi,
    toggleId = Math.random().toString(36).slice(2, 5);

  return html`<label
    for=${toggleId}
    class="notion-enhancer--menu-mod flex items-stretch rounded-[4px]
    bg-[color:var(--theme--bg-secondary)] w-full py-[18px] px-[16px]
    border border-[color:var(--theme--fg-border)] cursor-pointer
    transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
  >
    ${thumbnail
      ? html`<img
          src="${enhancerUrl(`${_src}/${thumbnail}`)}"
          class="rounded-[4px] mr-[12px] h-[74px] my-auto"
        />`
      : ""}
    <div class="flex-(& col) max-w-[50%]">
      <div class="flex items-center text-[14px] mb-[5px]">
        <h3 class="my-0">${name}</h3>
        ${[`v${version}`, ...tags].map((tag) => {
          return html`<span
            class="text-([12px] [color:var(--theme--fg-secondary)])
            ml-[8px] py-[2px] px-[6px] leading-tight tracking-wide
            rounded-[3px] bg-[color:var(--theme--bg-hover)]"
            >${tag}
          </span>`;
        })}
      </div>
      <${Description} class="mb-[6px]" innerHTML=${description} />
      <div class="mt-auto flex gap-x-[8px] text-[12px] leading-[16px]">
        ${authors.map((author) => {
          return html`<a href=${author.homepage} class="flex items-center">
            <img src=${author.avatar} alt="" class="h-[12px] rounded-full" />
            <span class="ml-[6px]">${author.name}</span>
          </a>`;
        })}
      </div>
    </div>

    <div class="flex ml-auto">
      ${options.length
        ? html`<button
            class="flex items-center p-[4px] rounded-[4px] transition
            text-[color:var(--theme--fg-secondary)] my-auto mr-[8px]
            duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]
            active:text-[color:var(--theme--fg-primary)]"
            onclick=${() => {
              setState({ transition: "slide-to-right", view: id });
            }}
          >
            <i class="i-settings w-[18px] h-[18px]"></i>
          </button>`
        : ""}
      <div class="my-auto scale-[1.15]">
        <${Toggle} id=${toggleId} ...${{ _get, _set }} />
      </div>
    </div>
  </label>`;
}

export { Mod };
