/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function Toggle({ _get, _set, _requireReload = true, ...props }) {
  let _initialValue;
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    $input = html`<input
      type="checkbox"
      class="hidden [&:checked+div>div]:(
      bg-[color:var(--theme--accent-primary)]
      after:translate-x-[12px])"
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

  return html`<div class="notion-enhancer--menu-toggle shrink-0">
    ${$input}
    <div
      tabindex="0"
      class="w-[30px] h-[18px] rounded-[44px] cursor-pointer
      transition duration-200 bg-[color:var(--theme--bg-hover)]"
      onkeydown=${(event) => {
        if ([" ", "Enter"].includes(event.key)) {
          event.preventDefault();
          $input.click();
        }
      }}
    >
      <div
        class="w-full h-full rounded-[44px] text-[12px]
        p-[2px] hover:bg-[color:var(--theme--bg-hover)]
        transition duration-200 after:(
          inline-block size-[14px] rounded-[44px]
          bg-[color:var(--theme--accent-primary\\_contrast)]
          transition duration-200 content-empty
        )"
      ></div>
    </div>
  </div>`;
}

export { Toggle };
