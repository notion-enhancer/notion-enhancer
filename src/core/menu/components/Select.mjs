/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { useState, extendProps } from "../state.mjs";
import { Popup } from "./Popup.mjs";

function Option({ value, _get, _set }) {
  const { html } = globalThis.__enhancerApi,
    $selected = html`<i class="ml-auto i-check w-[16px] h-[16px]"></i>`,
    $option = html`<div
      tabindex="0"
      role="button"
      class="select-none cursor-pointer rounded-[3px]
      flex items-center w-full h-[28px] px-[12px] leading-[1.2]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      onclick=${() => _set?.(value)}
      onkeydown=${(event) => {
        if (event.key === "Enter") _set?.(value);
      }}
    >
      <div class="mr-[6px] text-[14px] text-ellipsis overflow-hidden">
        ${value}
      </div>
    </div>`;
  useState(["rerender"], () => {
    _get?.().then((actualValue) => {
      if (actualValue === value) {
        $option.append($selected);
      } else $selected.remove();
    });
  });
  return $option;
}

function Select({ values, _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    // dir="rtl" overflows to the left during transition
    $select = html`<div
      dir="rtl"
      role="button"
      tabindex="0"
      class="appearance-none bg-transparent rounded-[4px] cursor-pointer
      text-[14px] leading-[28px] h-[28px] max-w-[256px] pl-[8px] pr-[28px]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      ...${props}
    ></div>`;
  useState(["rerender"], () => {
    _get?.().then((value) => ($select.innerText = value));
  });

  return html`<div class="notion-enhancer--menu-select relative">
    ${$select}
    <${Popup}
      trigger=${$select}
      onbeforeclose=${() => {
        $select.style.width = `${$select.offsetWidth}px`;
        $select.style.background = "transparent";
      }}
      onclose=${() => {
        $select.style.width = "";
        $select.style.background = "";
      }}
      >${values.map((value) => html`<${Option} ...${{ value, _get, _set }} />`)}
    <//>
    <i
      class="i-chevron-down pointer-events-none
      absolute right-[6px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </div>`;
}

export { Select };
