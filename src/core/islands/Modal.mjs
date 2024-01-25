/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

function Modal(props, ...children) {
  const { html, extendProps, addKeyListener } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-modal z-[999]
    fixed inset-0 w-screen h-screen group/modal
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

  let _openQueued;
  $modal.open = async () => {
    _openQueued = true;
    while (!document.contains($modal)) {
      if (!_openQueued) return;
      // dont trigger open until menu is in dom,
      // to ensure transition is shown when menu
      // does initially open
      await new Promise(requestAnimationFrame);
    }
    $modal.setAttribute("open", "");
    setTimeout(() => $modal.onopen?.(), 200);
  };
  $modal.close = () => {
    _openQueued = false;
    $modal.removeAttribute("open");
    if ($modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    setTimeout(() => $modal.onclose?.(), 200);
  };
  addKeyListener("Escape", () => {
    if (document.activeElement?.nodeName === "INPUT") return;
    $modal.close();
  });
  return $modal;
}

function Frame(props) {
  const { html, extendProps } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `rounded-[12px] w-[1150px] h-[calc(100vh-100px)] opacity-0
    max-w-[calc(100vw-100px)] max-h-[715px] overflow-hidden scale-95
    bg-[color:var(--theme--bg-primary)] drop-shadow-xl transition
    group-open/modal:(pointer-events-auto opacity-100 scale-100)`,
  });
  return html`<iframe ...${props}></iframe>`;
}

export { Modal, Frame };
