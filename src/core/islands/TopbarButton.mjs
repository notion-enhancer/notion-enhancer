/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function TopbarButton({ icon, ...props }) {
  const { html, extendProps, addMutationListener } = globalThis.__enhancerApi;
  extendProps(props, {
    tabindex: 0,
    role: "button",
    class: `notion-enhancer--topbar-button
    user-select-none h-[28px] w-[33px] duration-[20ms]
    transition inline-flex items-center justify-center mr-[2px]
    rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]
    &[data-active]:bg-[color:var(--theme--bg-hover)]`,
  });

  const notionTopbar = ".notion-topbar-favorite-button",
    $button = html`<button ...${props}>
      <i
        class="i-${icon} w-[20px] h-[20px]
        fill-[color:var(--theme--fg-secondary)]"
      />
    </button>`,
    addToTopbar = () => {
      if (document.contains($button)) return;
      document.querySelector(notionTopbar)?.after($button);
    };
  $button.addToTopbar = () => {
    addToTopbar();
    addMutationListener(notionTopbar, addToTopbar);
  };
  return $button;
}

export { TopbarButton };
