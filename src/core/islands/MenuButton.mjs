/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function MenuButton(
  { icon, notifications, themeOverridesLoaded, ...props },
  ...children
) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    tabindex: 0,
    role: "button",
    class: `notion-enhancer--menu-button
    flex select-none cursor-pointer rounded-[3px]
    text-[14px] my-px mx-[4px] py-[2px] px-[10px]
    transition hover:bg-[color:var(--theme--bg-hover)]`,
  });
  return html`<div ...${props}>
    <div class="flex items-center justify-center size-[22px] mr-[8px]">
      <i class="i-${icon}"></i>
    </div>
    <div>${children}</div>

    <div class="ml-auto my-auto${notifications > 0 ? "" : " hidden"}">
      <!-- accents are squashed into one variable for theming:
      use rgb to match notion if overrides not loaded -->
      <div
        class="flex justify-center size-[16px] font-semibold mb-[2px]
        text-([10px] [color:var(--theme--accent-secondary\\_contrast)])
        bg-[color:var(--theme--accent-secondary)] rounded-[3px]
        dark:bg-[color:${themeOverridesLoaded
          ? "var(--theme--accent-secondary)"
          : "rgb(180,65,60)"}]"
      >
        <span class="ml-[-0.5px]">${notifications}</span>
      </div>
    </div>
  </div>`;
}

export { MenuButton };
