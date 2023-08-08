/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

function Popup(
  { trigger, mode = "left", width = 250, maxWidth, ...props },
  ...children
) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    // known values for mode:
    // dropdown => panel switcher
    isDropdown = mode === "dropdown",
    // left => menu option select
    isLeft = mode === "left";
  extendProps(props, {
    class: `notion-enhancer--menu-popup group/popup
    absolute top-0 left-0 z-20 text-left font-normal
    flex-(& col) justify-center pointer-events-none
    items-end w-full ${isDropdown ? "" : "h-full"}`,
  });

  const $popup = html`<div ...${props}>
    <div
      class="relative ${isDropdown ? "w-full" : ""}
      ${isLeft ? "right-[calc(100%+8px)]" : ""}"
    >
      <div
        class="bg-[color:var(--theme--bg-secondary)]
        rounded-[4px] overflow-y-auto drop-shadow-xl max-h-[70vh]
        ${isDropdown ? "w-full" : "w-[250px] max-w-[calc(100vw-24px)]"} 
        transition duration-200 opacity-0 scale-95 py-[6px] px-[4px]
        group-open/popup:( pointer-events-auto opacity-100 scale-100)"
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
