/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { useState, extendProps } from "../state.mjs";

function Toggle({ _get, _set, ...props }) {
  const { html } = globalThis.__enhancerApi,
    $input = html`<input
      type="checkbox"
      class="hidden checked:sibling:children:(
      bg-[color:var(--theme--accent-primary)] after:translate-x-[12px])"
      ...${props}
    />`;
  extendProps($input, { onchange: () => _set?.($input.checked) });
  useState(["rerender"], () => {
    _get?.().then((checked) => ($input.checked = checked));
  });

  return html`<div class="notion-enhancer--menu-toggle shrink-0">
    ${$input}
    <div
      tabindex="0"
      class="w-[30px] h-[18px] rounded-[44px] cursor-pointer
      transition duration-200 bg-[color:var(--theme--bg-hover)]"
    >
      <div
        class="w-full h-full rounded-[44px] text-[12px]
        p-[2px] hover:bg-[color:var(--theme--bg-hover)]
        transition duration-200 after:(
          inline-block w-[14px] h-[14px] rounded-[44px]
          bg-[color:var(--theme--accent-primary\\_contrast)]
          transition duration-200
        )"
      ></div>
    </div>
  </div>`;
}

export { Toggle };
