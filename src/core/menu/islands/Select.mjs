/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Popup } from "./Popup.mjs";

function Option({ icon = "", value = "", _get, _set }) {
  const { html, useState } = globalThis.__enhancerApi,
    $selected = html`<i class="ml-auto i-check w-[16px] h-[16px]"></i>`,
    $option = html`<div
      tabindex="0"
      role="option"
      class="select-none cursor-pointer rounded-[3px]
      flex items-center w-full h-[28px] px-[12px] leading-[1.2]
      transition duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
      onclick=${() => _set?.(value)}
      onkeydown=${(event) => {
        if (event.key === "Enter") _set?.(value);
      }}
    >
      <div
        class="mr-[6px] inline-flex items-center gap-[6px]
        text-[14px] text-ellipsis overflow-hidden"
      >
        ${icon}<span>${value}</span>
      </div>
    </div>`;
  useState(["rerender"], async () => {
    if ((await _get?.()) === value) {
      $option.append($selected);
    } else $selected.remove();
  });
  return $option;
}

function Select({
  values,
  _get,
  _set,
  _requireReload = true,
  popupMode = "left",
  maxWidth = 256,
  ...props
}) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    // dir="rtl" overflows to the left during transition
    $select = html`<div
      dir="rtl"
      role="button"
      tabindex="0"
      class="appearance-none bg-transparent rounded-[4px]
      cursor-pointer text-[14px] leading-[28px] h-[28px]
      max-w-[${maxWidth}px] pl-[8px] pr-[28px] transition
      duration-[20ms] hover:bg-[color:var(--theme--bg-hover)]"
    ></div>`;

  let _initialValue;
  values = values.map((value) => {
    value = typeof value === "string" ? { value } : value;
    if (typeof value.icon === "string" && value.icon) {
      value.icon = html`<i class="i-${value.icon} h-[16px] w-[16px]" />`;
    } else value.icon ??= "";
    value.value ??= "";
    return value;
  });
  useState(["rerender"], async () => {
    const value = (await _get?.()) ?? ($select.innerText || values[0].value),
      icon = values.find((v) => v.value === value)?.icon;
    $select.innerHTML = "";
    // swap icon/value order for correct display when dir="rtl"
    $select.append(html`<div class="inline-flex items-center gap-[6px]">
      <span>${value}</span>${icon?.cloneNode?.(true) || ""}
    </div>`);
    if (_requireReload) {
      _initialValue ??= value;
      if (value !== _initialValue) setState({ databaseUpdated: true });
    }
  });

  extendProps(props, { class: "notion-enhancer--menu-select relative" });
  return html`<div ...${props}>
    ${$select}
    <${Popup}
      trigger=${$select}
      mode=${popupMode}
      onbeforeclose=${() => {
        $select.style.width = `${$select.offsetWidth}px`;
        $select.style.background = "transparent";
      }}
      onclose=${() => {
        $select.style.width = "";
        $select.style.background = "";
      }}
      >${values.map((value) => {
        return html`<${Option} ...${{ ...value, _get, _set }} />`;
      })}
    <//>
    <i
      class="i-chevron-down pointer-events-none
      absolute right-[6px] top-[6px] w-[16px] h-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </div>`;
}

export { Select };
