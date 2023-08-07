/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Popup({ trigger, ...props }, ...children) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--menu-popup
    group absolute top-0 left-0 w-full h-full
    flex-(& col) justify-center items-end z-20
    pointer-events-none font-normal text-left`,
  });

  const $popup = html`<div ...${props}>
    <div class="relative right-[calc(100%+8px)]">
      <div
        class="bg-[color:var(--theme--bg-secondary)]
        w-[250px] max-w-[calc(100vw-24px)] max-h-[70vh]
        py-[6px] px-[4px] drop-shadow-xl overflow-y-auto
        transition duration-200 opacity-0 scale-95 rounded-[4px]
        group-open:(pointer-events-auto opacity-100 scale-100)"
      >
        ${children}
      </div>
    </div>
  </div>`;
  $popup.open = () => {
    $popup.setAttribute("open", true);
    $popup.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = 0));
    setState({ popupOpen: true });
    $popup.onopen?.();
  };
  $popup.close = () => {
    $popup.onbeforeclose?.();
    $popup.removeAttribute("open");
    $popup.style.pointerEvents = "auto";
    $popup.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = -1));
    setTimeout(() => {
      $popup.style.pointerEvents = "";
      setState({ popupOpen: false });
      $popup.onclose?.();
    }, 200);
  };
  $popup.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = -1));

  document.addEventListener("click", (event) => {
    if (!$popup.hasAttribute("open")) return;
    if ($popup.contains(event.target) || $popup === event.target) return;
    if (trigger?.contains(event.target) || trigger === event.target) return;
    $popup.close();
  });
  useState(["rerender"], () => {
    if ($popup.hasAttribute("open")) $popup.close();
  });

  if (!trigger) return $popup;
  extendProps(trigger, {
    onclick: $popup.open,
    onkeydown(event) {
      if ([" ", "Enter"].includes(event.key)) {
        event.preventDefault();
        $popup.open();
      }
    },
  });
  return $popup;
}

export { Popup };
