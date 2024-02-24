/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Popup } from "./Popup.mjs";

function Option({ $icon = "", value = "", _get, _set }) {
  const { html, useState } = globalThis.__enhancerApi,
    $selected = html`<i class="ml-auto i-check size-[16px]"></i>`,
    $option = html`<div
      tabindex="0"
      role="option"
      class="select-none cursor-pointer rounded-[3px]
      flex items-center w-full h-[28px] px-[12px] leading-[1.2]
      transition duration-[20ms] focus:bg-[color:var(--theme--bg-hover)]"
      onmouseover=${(event) => event.target.focus()}
      onclick=${() => _set?.(value)}
      onkeydown=${(event) => {
        // if (["Enter", " "].includes(event.key)) _set?.(value);
      }}
    >
      <div
        class="mr-[6px] inline-flex items-center gap-[6px]
        text-[14px] text-ellipsis overflow-hidden"
      >
        ${$icon}<span>${value}</span>
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
  minWidth = 48,
  ...props
}) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    // dir="rtl" overflows to the left during transition
    $select = html`<div
      dir="rtl"
      role="button"
      tabindex="0"
      class="appearance-none bg-transparent rounded-[4px]
      h-[28px] max-w-[${maxWidth}px] min-w-[${minWidth}px]
      cursor-pointer text-[14px] overflow-hidden pr-[28px]
      transition duration-[20ms] leading-[28px] pl-[8px]
      hover:bg-[color:var(--theme--bg-hover)]"
    ></div>`;

  let xyz;
  const options = values.map((opt) => {
      if (["string", "number"].includes(typeof opt)) opt = { value: opt };
      if (!(opt?.$icon instanceof Element)) {
        if (typeof opt?.$icon === "string") {
          opt.$icon = html`<i class="i-${opt.$icon} size-[16px]" />`;
        } else delete opt.$icon;
      }
      return {
        ...opt,
        $option: html`<${Option} ...${{ ...opt, _get, _set }} />`,
        $value: html`<div
          class="inline-flex text-nowrap items-center gap-[6px]"
        >
          <!-- swap icon/value order for correct display when dir="rtl" -->
          <span>${opt.value}</span>${opt.$icon?.cloneNode(true) ?? ""}
        </div>`,
      };
    }),
    getSelected = async () => {
      const value = (await _get?.()) ?? $select.innerText,
        option = options.find((opt) => opt.value === value);
      if (!option) {
        console.log(1, options, options.length, options === xyz);
        _set?.(options[0].value);
      }
      return option || options[0];
    },
    onKeydown = (event) => {
      // const intercept = () => {
      //   event.preventDefault();
      //   event.stopPropagation();
      // };
      // if (event.key === "Escape") {
      //   intercept(setState({ rerender: true }));
      // } else if (!options.length) return;
      // // prettier-ignore
      // const $next = options.find(({ $option }) => $option === event.target)
      //     ?.$option.nextElementSibling ?? options.at(0).$option,
      //   $prev = options.find(({ $option }) => $option === event.target)
      //     ?.$option.previousElementSibling ?? options.at(-1).$option;
      // // overflow to opposite end of list from dir of travel
      // if (event.key === "ArrowUp") intercept($prev.focus());
      // if (event.key === "ArrowDown") intercept($next.focus());
      // // re-enable natural tab behaviour in notion interface
      // if (event.key === "Tab") event.stopPropagation();
    };
  xyz = options;
  console.log(2, options, options.length, options === xyz);

  let _initialValue;
  useState(["rerender"], async () => {
    if (!options.length) return;
    const { value, $value } = await getSelected();
    $select.innerHTML = "";
    $select.append($value);
    if (_requireReload) {
      _initialValue ??= value;
      if (value !== _initialValue) setState({ databaseUpdated: true });
    }
  });

  extendProps(props, { class: "notion-enhancer--menu-select relative" });
  return html`<div ...${props}>
    ${$select}<${Popup}
      tabindex="0"
      trigger=${$select}
      mode=${popupMode}
      onopen=${() => document.addEventListener("keydown", onKeydown, true)}
      onbeforeclose=${() => {
        document.removeEventListener("keydown", onKeydown, true);
        $select.style.width = `${$select.offsetWidth}px`;
        $select.style.background = "transparent";
      }}
      onclose=${() => {
        $select.style.width = "";
        $select.style.background = "";
      }}
      >${options.map(({ $option }) => $option)}
    <//>
    <i
      class="i-chevron-down pointer-events-none
      absolute right-[6px] top-[6px] size-[16px]
      text-[color:var(--theme--fg-secondary)]"
    ></i>
  </div>`;
}

export { Select };
