/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { setState, useState } from "../state.mjs";

function Checkbox({ _get, _set, _requireReload = true, ...props }) {
  let _initialValue;
  const { html, extendProps } = globalThis.__enhancerApi,
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
  useState(["rerender"], async () => {
    const checked = (await _get?.()) ?? $input.checked;
    $input.checked = checked;
    if (_requireReload) {
      _initialValue ??= checked;
      if (checked !== _initialValue) setState({ databaseUpdated: true });
    }
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
