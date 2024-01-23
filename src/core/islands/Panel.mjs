/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2021 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { Tooltip } from "./Tooltip.mjs";
import { TopbarButton } from "./TopbarButton.mjs";
import { Select } from "../menu/islands/Select.mjs";

// note: these islands are not reusable.
// panel views can be added via addPanelView,
// do not instantiate additional panels

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
  const { html, useState } = globalThis.__enhancerApi,
    $switcher = html`<div
      class="relative flex items-center grow
      font-medium p-[8.5px] ml-[4px] select-none"
    ></div>`,
    setView = (view) => _set?.(view);
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
  hotkey,
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
  const { html, useState, addKeyListener } = globalThis.__enhancerApi,
    { addMutationListener, removeMutationListener } = globalThis.__enhancerApi,
    $topbarToggle = html`<${TopbarButton}
      aria-label="Toggle side panel"
      icon="panel-right"
    />`,
    $panelToggle = html`<button
      aria-label="Toggle side panel"
      class="user-select-none h-[24px] w-[24px] duration-[20ms]
      transition inline-flex items-center justify-center mr-[10px]
      rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
    >
      <i
        class="i-chevrons-left w-[20px] h-[20px]
        text-[color:var(--theme--fg-secondary)] transition-transform
        group-&[data-pinned]/panel:rotate-180 duration-[${transitionDuration}ms]"
      />
    </button>`,
    $panel = html`<div
      class="notion-enhancer--panel group/panel order-2
      shrink-0 &[data-pinned]:w-[var(--panel--width,0)]"
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
      <aside
        class="border-(l-1 [color:var(--theme--fg-border)]) w-0
        group-&[data-pinned]/panel:(w-[var(--panel--width,0)]) h-[calc(100vh-45px)] bottom-0)
        absolute right-0 z-20 bg-[color:var(--theme--bg-primary)]  group-&[data-peeked]/panel:(
        w-[var(--panel--width,0)] h-[calc(100vh-120px)] bottom-[60px] rounded-l-[8px] border-(t-1 b-1)
        shadow-[rgba(15,15,15,0.1)_0px_0px_0px_1px,rgba(15,15,15,0.2)_0px_3px_6px,rgba(15,15,15,0.4)_0px_9px_24px])"
      >
        <div
          class="flex justify-between items-center
          border-(b [color:var(--theme--fg-border)])"
        >
          <${Switcher}
            ...${{ _get: _getView, _set: _setView, minWidth, maxWidth }}
          />
          ${$panelToggle}
        </div>
        <${View} ...${{ _get: _getView }} />
      </aside>
    </div>`;
  $panelToggle.onclick = $topbarToggle.onclick = () => $panel.toggle();
  $topbarToggle.addToTopbar();

  let preDragWidth, dragStartX, _animatedAt;
  const getWidth = async (width) => {
      if (width && !isNaN(width)) {
        width = Math.max(width, minWidth);
        width = Math.min(width, maxWidth);
      } else width = await _getWidth?.();
      if (isNaN(width)) width = minWidth;
      return width;
    },
    setInteractive = (interactive) => {
      $panel
        .querySelectorAll("[tabindex]")
        .forEach(($el) => ($el.tabIndex = interactive ? 1 : -1));
    },
    isAnimated = () => {
      if (!_animatedAt) return false;
      return Date.now() - _animatedAt <= transitionDuration;
    },
    isDragging = () => !isNaN(preDragWidth) && !isNaN(dragStartX),
    isPinned = () => $panel.hasAttribute("data-pinned"),
    isPeeked = () => $panel.hasAttribute("data-peeked"),
    isClosed = () => !isPinned() && !isPeeked();

  const closedWidth = { width: "0px" },
    openWidth = { width: "var(--panel--width, 0px)" },
    peekAnimation = {
      height: "calc(100vh - 120px)",
      bottom: "60px",
      borderTopWidth: "1px",
      borderBottomWidth: "1px",
      borderTopLeftRadius: "8px",
      borderBottomLeftRadius: "8px",
      boxShadow:
        "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 3px 6px, rgba(15, 15, 15, 0.4) 0px 9px 24px",
    },
    pinAnimation = {
      height: "calc(100vh - 45px)",
      bottom: "0px",
      borderTopWidth: "0px",
      borderBottomWidth: "0px",
      borderTopLeftRadius: "0px",
      borderBottomLeftRadius: "0px",
      boxShadow: "none",
    };

  const animationState = { ...closedWidth },
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    animate = ($target, keyframes) => {
      const opts = { fill: "forwards", duration: transitionDuration, easing };
      $target.animate(keyframes, opts);
    },
    animatePanel = (to) => {
      _animatedAt = Date.now();
      animate($panel.lastElementChild, [animationState, to]);
      Object.assign(animationState, to);
    };

  // dragging the resize handle horizontally will
  // adjust the width of the panel correspondingly
  const $resizeHandle = html`<div
      class="absolute opacity-0 h-full w-[3px] left-[-2px]
      active:cursor-text bg-[color:var(--theme--fg-border)] z-20
      transition duration-300 hover:(cursor-col-resize opacity-100)
      group-&[data-peeked]/panel:(w-[8px] left-[-1px] rounded-l-[7px])"
    >
      <div
        class="ml-[2px] bg-[color:var(--theme--bg-primary)]
        group-&[data-peeked]/panel:(my-px h-[calc(100%-2px)] rounded-l-[6px])"
      ></div>
    </div>`,
    startDrag = async (event) => {
      dragStartX = event.clientX;
      preDragWidth = await getWidth();
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", endDrag);
    },
    onDrag = (event) => {
      event.preventDefault();
      if (!isDragging()) return;
      $panel.resize(preDragWidth + (dragStartX - event.clientX));
    },
    endDrag = (event) => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", endDrag);
      if (!isDragging()) return;
      $panel.resize(preDragWidth + (dragStartX - event.clientX));
      // toggle panel if not resized
      if (dragStartX - event.clientX === 0) $panel.toggle();
      preDragWidth = dragStartX = undefined;
    };
  $resizeHandle.addEventListener("mousedown", startDrag);
  $panel.lastElementChild.prepend($resizeHandle);

  // add tooltips to panel pin/unpin toggles
  const $resizeTooltipClick = html`<span></span>`,
    $resizeTooltip = html`<${Tooltip}
      onbeforeshow=${() => {
        $resizeTooltipClick.innerText = isPinned() ? "close" : "lock open";
      }}
      ><b>Drag</b> to resize<br />
      <b>Click</b> to ${$resizeTooltipClick}
    <//>`,
    $toggleTooltipClick = html`<b></b>`,
    $toggleTooltip = html`<${Tooltip}
      class="text-start"
      onbeforeshow=${() => {
        $toggleTooltipClick.innerText = isPinned()
          ? "Close sidebar"
          : "Lock sidebar open";
      }}
      >${$toggleTooltipClick}<br />
      ${hotkey}
    <//>`,
    alignTooltipBelow = ($target) => {
      const rect = $target.getBoundingClientRect();
      return {
        x: rect.right,
        y: rect.bottom + $toggleTooltip.clientHeight / 2 + 6,
      };
    };
  $resizeTooltip.attach($resizeHandle, () => {
    const rect = $resizeHandle.getBoundingClientRect();
    return { x: rect.x - 6 };
  });
  $toggleTooltip.attach($topbarToggle, () => alignTooltipBelow($topbarToggle));
  $toggleTooltip.attach($panelToggle, () => alignTooltipBelow($panelToggle));

  // hovering over the peek trigger will temporarily
  // pop out an interactive preview of the panel
  let _peekDebounce;
  const $peekTrigger = html`<div
    class="absolute z-10 right-0 h-[calc(100vh-120px)] bottom-[60px] w-[96px]
    group-&[data-peeked]/panel:(w-[calc(var(--panel--width,0)+8px)])
    group-&[data-pinned]/panel:(w-[calc(var(--panel--width,0)+8px)])"
  ></div>`;
  $panel.prepend($peekTrigger);
  $panel.addEventListener("mouseout", () => {
    if (isDragging() || isAnimated() || isPinned()) return;
    if (!$panel.matches(":hover")) $panel.close();
  });
  $panel.addEventListener("mouseover", () => {
    _peekDebounce ??= setTimeout(() => {
      if (isClosed() && $panel.matches(":hover")) $panel.peek();
      _peekDebounce = undefined;
    }, 100);
  });

  // moves help button out of the way of open panel.
  // normally would place outside of an island, but in
  // this case is necessary for syncing up animations
  const notionHelp = ".notion-help-button",
    repositionHelp = async (width) => {
      const $notionHelp = document.querySelector(notionHelp);
      if (!$notionHelp) return;
      width ??= await getWidth();
      if (isNaN(width)) width = minWidth;
      if (isClosed()) width = 0;
      const to = `${26 + width}px`,
        from = $notionHelp.style.getPropertyValue("right");
      if (from === to) return;
      $notionHelp.style.setProperty("right", to);
      animate($notionHelp, [({ right: from }, { right: to })]);
      removeMutationListener(repositionHelp);
    };
  addMutationListener(notionHelp, repositionHelp);

  $panel.pin = () => {
    if (isPinned() || !panelViews.length) return;
    if (isClosed()) Object.assign(animationState, pinAnimation);
    animatePanel({ ...openWidth, ...pinAnimation });
    animate($panel, [closedWidth, openWidth]);
    $panel.removeAttribute("data-peeked");
    $panel.dataset.pinned = true;
    $topbarToggle.setAttribute("data-active", true);
    setInteractive(true);
    _setOpen(true);
    $panel.resize();
  };
  $panel.peek = () => {
    if (isPeeked() || !panelViews.length) return;
    if (isClosed()) Object.assign(animationState, peekAnimation);
    animatePanel({ ...openWidth, ...peekAnimation });
    // closing on mouseout is disabled mid-animation,
    // queue close in case mouse is no longer peeking
    // after the initial animation is complete
    setTimeout(() => {
      if (!isDragging() && !$panel.matches(":hover")) $panel.close();
    }, transitionDuration);
    $panel.removeAttribute("data-pinned");
    $panel.dataset.peeked = true;
    setInteractive(true);
    $panel.resize();
  };
  $panel.close = async () => {
    if (isClosed()) return;
    if (panelViews.length) _setOpen(false);
    $topbarToggle.removeAttribute("data-active");
    const width = (animationState.width = `${await getWidth()}px`);
    // only animate container close if it is actually taking up space,
    // otherwise will unnaturally grow + retrigger peek on peek mouseout
    if (isPinned()) animate($panel, [{ width }, closedWidth]);
    if (!$panel.matches(":hover")) {
      $panel.removeAttribute("data-pinned");
      $panel.removeAttribute("data-peeked");
      animatePanel(closedWidth);
      setInteractive(false);
      $panel.resize();
    } else $panel.peek();
  };
  $panel.toggle = () => {
    if (isPinned()) $panel.close();
    else $panel.pin();
  };
  // resizing handles visual resizes (inc. setting width to 0
  // if closed) and actual resizes on drag (inc. saving to db)
  $panel.resize = async (width) => {
    $resizeTooltip.hide();
    width = await getWidth(width);
    _setWidth?.(width);
    // works in conjunction with animations, acts as fallback
    // plus updates dependent styles e.g. page skeleton padding
    if (isClosed()) width = 0;
    const $parent = $panel.parentElement || $panel;
    $parent.style.setProperty("--panel--width", `${width}px`);
    if ($parent !== $panel) $panel.style.removeProperty("--panel--width");
    repositionHelp(width);
  };

  useState(["panelViews"], async ([panelViews = []]) => {
    $topbarToggle.style.display = panelViews.length ? "" : "none";
    if (panelViews.length && (await _getOpen())) $panel.pin();
    else $panel.close();
  });

  if (!hotkey) return $panel;
  addKeyListener(hotkey, (event) => {
    event.preventDefault();
    event.stopPropagation();
    $panel.toggle();
  });

  return $panel;
}

Object.assign((globalThis.__enhancerApi ??= {}), {
  addPanelView,
  removePanelView,
});

export { Panel };
