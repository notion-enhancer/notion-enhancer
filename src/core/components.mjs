/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Frame(props) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `rounded-[5px] w-[1150px] h-[calc(100vh-100px)]
    max-w-[calc(100vw-100px)] max-h-[715px] overflow-hidden
    bg-[color:var(--theme--bg-primary)] drop-shadow-xl
    group-open:(pointer-events-auto opacity-100 scale-100)
    transition opacity-0 scale-95`,
  });
  return html`<iframe ...${props}></iframe>`;
}

function Modal(props, ...children) {
  const { html, extendProps, addKeyListener } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-modal group
    z-[999] fixed inset-0 w-screen h-screen
    transition pointer-events-none opacity-0
    open:(pointer-events-auto opacity-100)`,
  });
  const $modal = html`<div ...${props}>
    <div
      class="fixed inset-0 bg-[color:var(--theme--bg-overlay)]"
      onclick=${() => $modal.close()}
    ></div>
    <div
      class="fixed inset-0 flex w-screen h-screen
      items-center justify-center pointer-events-none"
    >
      ${children}
    </div>
  </div>`;
  $modal.open = () => {
    $modal.setAttribute("open", "");
    $modal.onopen?.();
  };
  $modal.close = () => {
    $modal.onbeforeclose?.();
    $modal.removeAttribute("open");
    $modal.style.pointerEvents = "auto";
    setTimeout(() => {
      $modal.style.pointerEvents = "";
      $modal.onclose?.();
    }, 200);
  };
  addKeyListener("Escape", () => {
    if (document.activeElement?.nodeName === "INPUT") return;
    $modal.close();
  });
  return $modal;
}

function Button(
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
    <div class="flex items-center justify-center w-[22px] h-[22px] mr-[8px]">
      <i class="i-${icon}"></i>
    </div>
    <div>${children}</div>

    <div class="ml-auto my-auto${notifications > 0 ? "" : " hidden"}">
      <!-- accents are squashed into one variable for theming:
      use rgb to match notion if overrides not loaded -->
      <div
        class="flex justify-center w-[16px] h-[16px] font-semibold
        text-([10px] [color:var(--theme--accent-secondary\\_contrast)])
        bg-[color:var(--theme--accent-secondary)] rounded-[3px] mb-[2px]
        dark:bg-[color:${themeOverridesLoaded
          ? "var(--theme--accent-secondary)"
          : "rgb(180,65,60)"}]"
      >
        <span class="ml-[-0.5px]">${notifications}</span>
      </div>
    </div>
  </div>`;
}

export { Frame, Modal, Button };
