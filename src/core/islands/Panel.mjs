/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Tooltip } from "./Tooltip.mjs";
import { Select } from "../menu/islands/Select.mjs";

function View(props) {
  const { html } = globalThis.__enhancerApi;
  return html``;
}

function Panel({
  _getWidth,
  _setWidth,
  _getOpen,
  _setOpen,
  minWidth = 250,
  maxWidth = 640,
  transitionDuration = 300,
  ...props
}) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    { addMutationListener, removeMutationListener } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--side-panel order-2 shrink-0
    transition-[width] open:w-[var(--side\\_panel--width)]
    border-l-1 border-[color:var(--theme--fg-border)]
    relative bg-[color:var(--theme--bg-primary)] w-0
    duration-[${transitionDuration}ms] group/panel`,
  });

  const values = [
      {
        icon: "type",
        value: "word counter",
      },
      {
        // prettier-ignore
        $icon: html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="5" cy="7" r="2.8"/>
          <circle cx="5" cy="17" r="2.79"/>
          <path d="M21,5.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,5.5,21.55,5.95,21,5.95z"/>
          <path d="M17,10.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,9.6,17.55,10.05,17,10.05z"/>
          <path d="M21,15.95H11c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1v0C22,15.5,21.55,15.95,21,15.95z" />
          <path d="M17,20.05h-6c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C18,19.6,17.55,20.05,17,20.05z"/>
        </svg>`,
        value: "outliner",
      },
    ],
    _get = () => useState(["panelView"])[0],
    _set = (value) => {
      setState({ panelView: value, rerender: true });
    };

  const $resize = html`<div
      class="absolute h-full w-[3px] left-[-3px]
      z-10 transition duration-300 hover:(cursor-col-resize
      shadow-[var(--theme--fg-border)_-2px_0px_0px_0px_inset])
      active:cursor-text group-not-[open]/panel:hidden"
    ></div>`,
    $close = html`<button
      aria-label="Close side panel"
      class="user-select-none h-[24px] w-[24px] duration-[20ms]
      transition inline-flex items-center justify-center mr-[10px]
      rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
    >
      <i
        class="i-chevrons-right w-[20px] h-[20px]
        text-[color:var(--theme--fg-secondary)]"
      />
    </div>`,
    $switcher = html`<div
      class="relative flex items-center
      font-medium p-[8.5px] ml-[4px] grow"
    >
      <${Select}
        popupMode="dropdown"
        maxWidth="${maxWidth}"
        class="w-full text-left"
        ...${{ _get, _set, values, maxWidth: maxWidth - 56 }}
      />
    </div>`,
    $view = html`<div class="h-full overflow-y-auto"></div>`,
    $panel = html`<aside ...${props}>
      ${$resize}
      <div
        class="flex justify-between items-center
        border-(b [color:var(--theme--fg-border)])"
      >
        ${$switcher}${$close}
      </div>
      ${$view}
    </aside>`;

  let preDragWidth,
    dragStartX = 0;
  const startDrag = async (event) => {
      dragStartX = event.clientX;
      preDragWidth = await _getWidth?.();
      if (isNaN(preDragWidth)) preDragWidth = minWidth;
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", endDrag);
      $panel.style.transitionDuration = "0ms";
    },
    onDrag = (event) => {
      event.preventDefault();
      $panel.resize(preDragWidth + (dragStartX - event.clientX));
    },
    endDrag = (event) => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", endDrag);
      $panel.style.transitionDuration = "";
      $panel.resize(preDragWidth + (dragStartX - event.clientX));
      // trigger panel close if not resized
      if (dragStartX - event.clientX === 0) $panel.close();
    };
  $resize.addEventListener("mousedown", startDrag);

  const $tooltip = html`<${Tooltip}>
      <span>Drag</span> to resize<br />
      <span>Click</span> to closed
    <//>`,
    showTooltip = (event) => {
      setTimeout(() => {
        const panelOpen = $panel.hasAttribute("open"),
          handleHovered = $resize.matches(":hover");
        if (!panelOpen || !handleHovered) return;
        const { x } = $resize.getBoundingClientRect();
        $tooltip.show(x, event.clientY);
      }, 200);
    };
  $resize.addEventListener("mouseover", showTooltip);
  $resize.addEventListener("mouseout", () => $tooltip.hide());
  $close.addEventListener("click", () => $panel.close());

  // normally would place outside of an island, but in
  // this case is necessary for syncing up animations
  const notionHelp = ".notion-help-button",
    repositionHelp = async () => {
      const $notionHelp = document.querySelector(notionHelp);
      if (!$notionHelp) return;
      let width = await _getWidth?.();
      if (isNaN(width)) width = minWidth;
      if (!$panel.hasAttribute("open")) width = 0;
      const position = $notionHelp.style.getPropertyValue("right"),
        destination = `${26 + width}px`,
        keyframes = [{ right: position }, { right: destination }],
        options = {
          duration: transitionDuration,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        };
      $notionHelp.style.setProperty("right", destination);
      $notionHelp.animate(keyframes, options);
      removeMutationListener(repositionHelp);
    };
  addMutationListener(notionHelp, repositionHelp);

  $panel.resize = async (width) => {
    $tooltip.hide();
    if (width) {
      width = Math.max(width, minWidth);
      width = Math.min(width, maxWidth);
      _setWidth?.(width);
    } else width = await _getWidth?.();
    if (isNaN(width)) width = minWidth;
    $panel.style.setProperty("--side_panel--width", `${width}px`);
    repositionHelp();
  };
  $panel.open = () => {
    $panel.setAttribute("open", true);
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = 0));
    setState({ panelOpen: true });
    $panel.onopen?.();
    _setOpen(true);
    $panel.resize();
  };
  $panel.close = () => {
    $tooltip.hide();
    $panel.onbeforeclose?.();
    $panel.removeAttribute("open");
    $panel.style.pointerEvents = "auto";
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = -1));
    setState({ panelOpen: false });
    repositionHelp();
    _setOpen(false);
    setTimeout(() => {
      $panel.style.pointerEvents = "";
      $panel.onclose?.();
    }, transitionDuration);
  };
  _getOpen().then((open) => {
    if (open) $panel.open();
  });

  return $panel;
}

export { Panel };
