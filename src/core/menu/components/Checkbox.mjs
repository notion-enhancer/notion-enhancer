/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { useState, extendProps } from "../state.mjs";

function Checkbox({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="checkbox"
      class="hidden checked:sibling:(px-px
      bg-[color:var(--theme--accent-primary)])
      not-checked:sibling:(children:text-transparent
        border-(& [color:var(--theme--fg-primary)])
        hover:bg-[color:var(--theme--bg-hover)])"
      ...${props}
    />`;
  extendProps($input, { onchange: () => _set?.($input.checked) });
  useState(["rerender"], () => {
    _get?.().then((checked) => ($input.checked = checked));
  });

  return html`<label
    tabindex="0"
    class="notion-enhancer--menu-checkbox cursor-pointer"
    onkeydown=${(event) => {
      if ([" ", "Enter"].includes(event.key)) {
        event.preventDefault();
        $input.click();
      }
    }}
  >
    ${$input}
    <div class="flex items-center h-[16px] transition duration-[200ms]">
      <i
        class="i-check w-[14px] h-[14px]
        text-[color:var(--theme--accent-primary\\_contrast)]"
      ></i>
    </div>
  </label>`;
}

export { Checkbox };
