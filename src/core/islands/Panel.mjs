/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Tooltip } from "./Tooltip.mjs";
import { Select } from "../menu/islands/Select.mjs";

function PanelView(props) {
  const { html } = globalThis.__enhancerApi;
  return html``;
}

function PanelSwitcher(props) {
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

  const $resizeHandle = html`<div
      class="absolute h-full w-[3px] left-[-3px]
      z-10 transition duration-300 hover:(cursor-col-resize
      shadow-[var(--theme--fg-border)_-2px_0px_0px_0px_inset])
      active:cursor-text group-not-[open]/panel:hidden"
    ></div>`,
    $chevronClose = html`<button
      aria-label="Close side panel"
      class="user-select-none h-[24px] w-[24px] duration-[20ms]
      transition inline-flex items-center justify-center mr-[10px]
      rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
    >
      <i
        class="i-chevrons-right w-[20px] h-[20px]
        text-[color:var(--theme--fg-secondary)]"
      />
    </div>`;

  const values = ["default", "outliner", "word counter"],
    _get = () => useState(["panelView"])[0],
    _set = (value) => {
      setState({ panelView: value, rerender: true });
    };

  const $panel = html`<aside ...${props}>
    ${$resizeHandle}
    <div
      class="flex justify-between items-center
      border-(b [color:var(--theme--fg-border)])"
    >
      <div
        class="relative flex grow font-medium items-center p-[8.5px] ml-[4px]"
      >
        <${Select}
          popupMode="dropdown"
          maxWidth="${maxWidth}"
          class="w-full text-left"
          ...${{ _get, _set, values, maxWidth: maxWidth - 56 }}
        />
      </div>
      ${$chevronClose}
    </div>
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
  $resizeHandle.addEventListener("mousedown", startDrag);

  const $tooltip = html`<${Tooltip}>
      <span>Drag</span> to resize<br />
      <span>Click</span> to closed
    <//>`,
    showTooltip = (event) => {
      setTimeout(() => {
        const panelOpen = $panel.hasAttribute("open"),
          handleHovered = $resizeHandle.matches(":hover");
        if (!panelOpen || !handleHovered) return;
        const { x } = $resizeHandle.getBoundingClientRect();
        $tooltip.show(x, event.clientY);
      }, 200);
    };
  $resizeHandle.addEventListener("mouseover", showTooltip);
  $resizeHandle.addEventListener("mouseout", () => $tooltip.hide());
  $chevronClose.addEventListener("click", () => $panel.close());

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
