/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
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
  const { html, useState } = globalThis.__enhancerApi,
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
  const { html, setState, useState } = globalThis.__enhancerApi,
    $switcher = html`<div
      class="relative flex items-center grow
      font-medium p-[8.5px] ml-[4px] select-none"
    ></div>`,
    setView = (view) => {
      _set?.(view);
      setState({ activePanelView: view });
    };
  useState(["panelViews"], ([panelViews = []]) => {
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
  minWidth = 256,
  maxWidth = 640,
  transitionDuration = 300,
}) {
  const { html, setState, useState } = globalThis.__enhancerApi,
    { addMutationListener, removeMutationListener } = globalThis.__enhancerApi,
    $panel = html`<aside
      class="notion-enhancer--panel group/panel
      order-2 shrink-0 [open]:w-[var(--panel--width,0)]"
    >
      <style>
        .notion-frame {
          flex-direction: row !important;
        }
        /* prevent page load skeletons overlapping with panel */
        .notion-frame [role="progressbar"] {
          padding-right: var(--panel--width);
        }
        .notion-frame [role="progressbar"] > div {
          overflow-x: clip;
        }
      </style>
      <div
        class="absolute right-0 bottom-0 bg-[color:var(--theme--bg-primary)]
        z-20 border-(l-1 [color:var(--theme--fg-border)]) w-[var(--panel--width,0)]
        transition-[width,bottom,top,border-radius] duration-[${transitionDuration}ms]
        hover:transition-[height,width,bottom,top,border-radius] h-[calc(100vh-45px)]
        group-not-[open]/panel:(bottom-[60px] h-[calc(100vh-120px)] rounded-l-[8px] border-(t-1 b-1)
        shadow-[rgba(15,15,15,0.1)_0px_0px_0px_1px,rgba(15,15,15,0.2)_0px_3px_6px,rgba(15,15,15,0.4)_0px_9px_24px])"
      >
        <div
          class="flex justify-between items-center
          border-(b [color:var(--theme--fg-border)])"
        >
          <${Switcher}
            ...${{ _get: _getView, _set: _setView, minWidth, maxWidth }}
          />
          <button
            aria-label="Toggle side panel"
            class="user-select-none h-[24px] w-[24px] duration-[20ms]
            transition inline-flex items-center justify-center mr-[10px]
            rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
            onclick=${() => $panel.toggle()}
          >
            <i
              class="i-chevrons-left w-[20px] h-[20px]
              group-[open]/panel:rotate-180 duration-[${transitionDuration}ms]
              transition-transform text-[color:var(--theme--fg-secondary)]"
            />
          </button>
        </div>
        <${View} ...${{ _get: _getView }} />
      </div>
    </aside>`;

  let preDragWidth,
    dragStartX = 0;
  const $resizeHandle = html`<div
      class="absolute h-full w-[3px] left-[-2px]
      z-20 active:cursor-text transition duration-300
      bg-[color:var(--theme--fg-border)] opacity-0
      group-not-[open]/panel:(w-[8px] left-[-1px] rounded-l-[7px])
      hover:(cursor-col-resize opacity-100)"
    >
      <div
        class="ml-[2px] bg-[color:var(--theme--bg-primary)]
        group-not-[open]/panel:(my-px h-[calc(100%-2px)] rounded-l-[6px])"
      ></div>
    </div>`,
    $onResizeClick = html`<span>close</span>`,
    $resizeTooltip = html`<${Tooltip}>
      <b>Drag</b> to resize<br />
      <b>Click</b> to ${$onResizeClick}
    <//>`,
    showTooltip = (event) => {
      setTimeout(() => {
        const handleHovered = $resizeHandle.matches(":hover");
        if (!handleHovered) return;
        const panelOpen = $panel.hasAttribute("open"),
          { x } = $resizeHandle.getBoundingClientRect();
        $onResizeClick.innerText = panelOpen ? "close" : "lock open";
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
      // toggle panel if not resized
      if (dragStartX - event.clientX === 0) $panel.toggle();
    };
  $resizeHandle.addEventListener("mouseout", $resizeTooltip.hide);
  $resizeHandle.addEventListener("mousedown", startDrag);
  $resizeHandle.addEventListener("mouseover", showTooltip);
  $panel.prepend($resizeHandle);

  // pop out panel preview when hovering near the right edge
  // of the screen, otherwise collapse panel when closed
  const $hoverTrigger = html`<div
    class="z-10 absolute right-0 bottom-[60px] h-[calc(100vh-120px)]
    w-[64px] transition-[width] duration-[${transitionDuration}ms]"
  ></div>`;
  $hoverTrigger.addEventListener("mouseover", () => $panel.resize(0, true));
  $panel.addEventListener("mouseenter", () => $panel.resize());
  $panel.addEventListener("mouseout", () => $panel.resize());
  $panel.append($hoverTrigger);

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

  $panel.resize = async (width, peek = false) => {
    $resizeTooltip.hide();
    if (width && !isNaN(width)) {
      width = Math.max(width, minWidth);
      width = Math.min(width, maxWidth);
      _setWidth?.(width);
    } else width = await _getWidth?.();
    if (isNaN(width)) width = minWidth;
    const panelOpen = $panel.hasAttribute("open"),
      panelHovered = $panel.matches(":hover");
    if (panelOpen) {
    } else {
      if (!panelHovered && !peek) width = 0;
    }
    const $cssVarTarget = $panel.parentElement || $panel;
    $cssVarTarget.style.setProperty("--panel--width", `${width}px`);
    if ($cssVarTarget !== $panel) $panel.style.removeProperty("--panel--width");
    repositionHelp(width);
  };
  $panel.open = () => {
    if (!panelViews.length) return;
    $panel.setAttribute("open", true);
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = 1));
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
    if (panelViews.length) _setOpen(false);
    setTimeout(() => {
      $panel.style.pointerEvents = "";
      $panel.onclose?.();
    }, transitionDuration);
  };
  $panel.toggle = () => {
    if ($panel.hasAttribute("open")) $panel.close();
    else $panel.open();
  };
  useState(["panelViews"], async ([panelViews = []]) => {
    if (panelViews.length && (await _getOpen())) $panel.open();
    else $panel.close();
  });
  return $panel;
}

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  addPanelView,
  removePanelView,
});

export { Panel };
