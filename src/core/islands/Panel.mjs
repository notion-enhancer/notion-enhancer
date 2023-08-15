/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Tooltip } from "./Tooltip.mjs";
import { Select } from "../menu/islands/Select.mjs";

// note: these islands do not accept extensible
// properties, i.e. they are not reusable.
// please register your own interfaces via
// globalThis.__enhancerApi.addPanelView and
// not by re-instantiating additional panels

let panelViews = [],
  // "$icon" may either be an actual dom element,
  // or an icon name from the lucide icons set
  addPanelView = ({ title, $icon, $view }) => {
    panelViews.push([{ title, $icon }, $view]);
    panelViews.sort(([{ title: a }], [{ title: b }]) => a.localeCompare(b));
    const { setState } = globalThis.__enhancerApi;
    setState?.({ panelViews });
  },
  removePanelView = ($view) => {
    panelViews = panelViews.filter(([, v]) => v !== $view);
    const { setState } = globalThis.__enhancerApi;
    setState?.({ panelViews });
  };

function View({ _get }) {
  const { html, setState, useState } = globalThis.__enhancerApi,
    $container = html`<div
      class="overflow-(y-auto x-hidden)
      h-full min-w-[var(--panel--width)]"
    ></div>`;
  useState(["rerender"], async () => {
    const openView = await _get?.(),
      $view =
        panelViews.find(([{ title }]) => {
          return title === openView;
        })?.[1] || panelViews[0]?.[1];
    if (!$container.contains($view)) {
      $container.innerHTML = "";
      $container.append($view);
    }
  });
  return $container;
}

function Switcher({ _get, _set, minWidth, maxWidth }) {
  const { html, extendProps, setState, useState } = globalThis.__enhancerApi,
    $switcher = html`<div
      class="relative flex items-center
      font-medium p-[8.5px] ml-[4px] grow"
    ></div>`,
    setView = (view) => {
      _set?.(view);
      setState({ activePanelView: view });
    };
  useState(["panelViews"], ([panelViews]) => {
    const values = panelViews.map(([{ title, $icon }]) => {
      // panel switcher internally uses the select island,
      // which expects an option value rather than a title
      return { value: title, $icon };
    });
    $switcher.innerHTML = "";
    $switcher.append(html`<${Select}
      popupMode="dropdown"
      class="w-full text-left"
      maxWidth=${maxWidth - 56}
      minWidth=${minWidth - 56}
      ...${{ _get, _set: setView, values }}
    />`);
  });
  return $switcher;
}

function Panel({
  _getWidth,
  _setWidth,
  _getOpen,
  _setOpen,
  _getView,
  _setView,
  minWidth = 250,
  maxWidth = 640,
  transitionDuration = 300,
}) {
  const { html, setState, useState } = globalThis.__enhancerApi,
    { addMutationListener, removeMutationListener } = globalThis.__enhancerApi,
    $panel = html`<aside
      class="notion-enhancer--panel relative order-2
      shrink-0 bg-[color:var(--theme--bg-primary)]
      border-(l-1 [color:var(--theme--fg-border)])
      transition-[width] w-[var(--panel--width,0)]
      duration-[${transitionDuration}ms] group/panel"
    >
      <style>
        .notion-frame {
          flex-direction: row !important;
        }
        .notion-frame [role="progressbar"] {
          padding-right: var(--panel--width);
        }
        .notion-frame [role="progressbar"] > div {
          overflow-x: clip;
        }
      </style>
      <div
        class="flex justify-between items-center
        border-(b [color:var(--theme--fg-border)])"
      >
        <${Switcher}
          ...${{ _get: _getView, _set: _setView, minWidth, maxWidth }}
        />
        <button
          aria-label="Close side panel"
          class="user-select-none h-[24px] w-[24px] duration-[20ms]
          transition inline-flex items-center justify-center mr-[10px]
          rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
          onclick=${() => $panel.close()}
        >
          <i
            class="i-chevrons-right w-[20px] h-[20px]
            text-[color:var(--theme--fg-secondary)]"
          />
        </button>
      </div>
      <${View} ...${{ _get: _getView }} />
    </aside>`;

  let preDragWidth,
    dragStartX = 0;
  const $resizeHandle = html`<div
      class="absolute h-full w-[3px] left-[-3px]
      z-10 transition duration-300 hover:(cursor-col-resize
      shadow-[var(--theme--fg-border)_-2px_0px_0px_0px_inset])
      active:cursor-text group-not-[open]/panel:hidden"
    ></div>`,
    $resizeTooltip = html`<${Tooltip}>
      <span>Drag</span> to resize<br />
      <span>Click</span> to closed
    <//>`,
    showTooltip = (event) => {
      setTimeout(() => {
        const panelOpen = $panel.hasAttribute("open"),
          handleHovered = $resizeHandle.matches(":hover");
        if (!panelOpen || !handleHovered) return;
        const { x } = $resizeHandle.getBoundingClientRect();
        $resizeTooltip.show(x, event.clientY);
      }, 200);
    },
    startDrag = async (event) => {
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
  $resizeHandle.addEventListener("mouseout", $resizeTooltip.hide);
  $resizeHandle.addEventListener("mousedown", startDrag);
  $resizeHandle.addEventListener("mouseover", showTooltip);
  $panel.prepend($resizeHandle);

  // normally would place outside of an island, but in
  // this case is necessary for syncing up animations
  const notionHelp = ".notion-help-button",
    repositionHelp = async (width) => {
      const $notionHelp = document.querySelector(notionHelp);
      if (!$notionHelp) return;
      width ??= await _getWidth?.();
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
    $resizeTooltip.hide();
    if (width) {
      width = Math.max(width, minWidth);
      width = Math.min(width, maxWidth);
      _setWidth?.(width);
    } else width = await _getWidth?.();
    if (isNaN(width)) width = minWidth;
    if (!$panel.hasAttribute("open")) width = 0;
    const $cssVarTarget = $panel.parentElement || $panel;
    $cssVarTarget.style.setProperty("--panel--width", `${width}px`);
    repositionHelp(width);
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
    $resizeTooltip.hide();
    $panel.onbeforeclose?.();
    $panel.removeAttribute("open");
    $panel.style.pointerEvents = "auto";
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = -1));
    $panel.resize();
    setState({ panelOpen: false });
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

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  addPanelView,
  removePanelView,
});

export { Panel };
