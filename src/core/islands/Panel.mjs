/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// <div class="absolute top-0">
//   <svg
//     role="graphics-symbol"
//     viewBox="0 0 16 16"
//     class="doubleChevronRight"
//     style="width: 16px; height: 16px; display: block; fill: rgba(255, 255, 255, 0.443); flex-shrink: 0;"
//   >
//     <path d="M2.25781 14.1211C2.47656 14.1211 2.66797 14.0391 2.81836 13.8887L8.14355 8.67969C8.32812 8.49512 8.41699 8.29688 8.41699 8.06445C8.41699 7.8252 8.32812 7.62012 8.14355 7.44922L2.81836 2.24023C2.66797 2.08984 2.4834 2.00781 2.25781 2.00781C1.81348 2.00781 1.46484 2.35645 1.46484 2.80078C1.46484 3.0127 1.55371 3.21777 1.7041 3.375L6.50977 8.05762L1.7041 12.7539C1.55371 12.9043 1.46484 13.1094 1.46484 13.3281C1.46484 13.7725 1.81348 14.1211 2.25781 14.1211ZM8.36914 14.1211C8.58789 14.1211 8.77246 14.0391 8.92285 13.8887L14.2549 8.67969C14.4395 8.49512 14.5283 8.29688 14.5283 8.06445C14.5283 7.8252 14.4326 7.62012 14.2549 7.44922L8.92285 2.24023C8.77246 2.08984 8.58789 2.00781 8.36914 2.00781C7.9248 2.00781 7.56934 2.35645 7.56934 2.80078C7.56934 3.0127 7.66504 3.21777 7.81543 3.375L12.6211 8.05762L7.81543 12.7539C7.66504 12.9043 7.56934 13.1094 7.56934 13.3281C7.56934 13.7725 7.9248 14.1211 8.36914 14.1211Z"></path>
//   </svg>
// </div>;

import { Tooltip } from "./Tooltip.mjs";

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
  minWidth = 260,
  maxWidth = 640,
  ...props
}) {
  const { html, extendProps } = globalThis.__enhancerApi,
    { addMutationListener, removeMutationListener } = globalThis.__enhancerApi;
  extendProps(props, {
    class: `notion-enhancer--side-panel order-2 shrink-0
    transition-[width] open:w-[var(--side\\_panel--width)]
    w-0 border-l-1 border-[color:var(--theme--fg-border)]
    relative bg-[color:var(--theme--bg-primary)] group`,
  });

  const $resizeHandle = html`<div
      class="absolute h-full w-[3px] left-[-3px]
      z-10 transition duration-300 hover:(cursor-col-resize
      shadow-[var(--theme--fg-border)_-2px_0px_0px_0px_inset])
      active:cursor-text group-not-[open]:hidden"
    ></div>`,
    $chevronClose = html`<button
      aria-label="Close side panel"
      class="user-select-none h-[24px] w-[24px] duration-[20ms]
      transition inline-flex items-center justify-center mr-[10px]
      rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]"
    >
      <svg
        viewBox="0 0 16 16"
        class="w-[16px] h-[16px] fill-[color:var(--theme--fg-secondary)]"
      >
        <path
          d="M2.25781 14.1211C2.47656 14.1211 2.66797 14.0391 2.81836 13.8887L8.14355 8.67969C8.32812 8.49512 8.41699 8.29688 8.41699 8.06445C8.41699 7.8252 8.32812 7.62012 8.14355 7.44922L2.81836 2.24023C2.66797 2.08984 2.4834 2.00781 2.25781 2.00781C1.81348 2.00781 1.46484 2.35645 1.46484 2.80078C1.46484 3.0127 1.55371 3.21777 1.7041 3.375L6.50977 8.05762L1.7041 12.7539C1.55371 12.9043 1.46484 13.1094 1.46484 13.3281C1.46484 13.7725 1.81348 14.1211 2.25781 14.1211ZM8.36914 14.1211C8.58789 14.1211 8.77246 14.0391 8.92285 13.8887L14.2549 8.67969C14.4395 8.49512 14.5283 8.29688 14.5283 8.06445C14.5283 7.8252 14.4326 7.62012 14.2549 7.44922L8.92285 2.24023C8.77246 2.08984 8.58789 2.00781 8.36914 2.00781C7.9248 2.00781 7.56934 2.35645 7.56934 2.80078C7.56934 3.0127 7.66504 3.21777 7.81543 3.375L12.6211 8.05762L7.81543 12.7539C7.66504 12.9043 7.56934 13.1094 7.56934 13.3281C7.56934 13.7725 7.9248 14.1211 8.36914 14.1211Z"
        ></path>
      </svg>
    </div>`,
    $panel = html`<aside ...${props}>
      ${$resizeHandle}
      <div
        class="flex justify-between items-center
        border-(b [color:var(--theme--fg-border)])"
      >
        <div
          style="font-size: 14px; color: rgba(255, 255, 255, 0.81); font-weight: 500; display: flex; align-items: center; padding: 12px 12px 12px 16px;"
        >
          Comments
        </div>
        ${$chevronClose}
      </div>
    </aside>`;

  let preDragWidth,
    userDragActive,
    dragStartX = 0;
  const startDrag = async (event) => {
      userDragActive = true;
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
      userDragActive = false;
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", endDrag);
      $panel.resize(preDragWidth + (dragStartX - event.clientX));
      $panel.style.transitionDuration = "";
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
  $resizeHandle.addEventListener("click", () => {
    if (!userDragActive) $panel.close();
  });
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
        options = { duration: 150, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };
      $notionHelp.style.setProperty("right", destination);
      $notionHelp.animate(keyframes, options);
      removeMutationListener(repositionHelp);
    };
  addMutationListener(notionHelp, repositionHelp);

  const notionTopbarMore = ".notion-topbar-more-button",
    $topbarPanelButton = html`<button
      aria-label="Open side panel"
      class="user-select-none h-[28px] w-[33px] duration-[20ms]
      transition inline-flex items-center justify-center mr-[2px]
      rounded-[3px] hover:bg-[color:var(--theme--bg-hover)]
      [data-active]:bg-[color:var(--theme--bg-hover)]"
    >
      <i
        class="i-panel-right w-[20px] h-[20px] fill-[color:var(--theme--fg-secondary)]"
      />
    </button>`,
    appendToDom = () => {
      if (document.contains($topbarPanelButton)) return;
      const $notionTopbarMore = document.querySelector(notionTopbarMore);
      $notionTopbarMore?.before($topbarPanelButton);
    };
  $topbarPanelButton.addEventListener("click", () => {
    if ($panel.hasAttribute("open")) $panel.close();
    else $panel.open();
  });
  addMutationListener(notionTopbarMore, appendToDom);
  appendToDom();

  $panel.resize = async (width) => {
    $tooltip.hide();
    if (width) {
      width = Math.max(width, minWidth);
      width = Math.min(width, maxWidth);
      if (!userDragActive) _setWidth?.(width);
    } else width = await _getWidth?.();
    if (isNaN(width)) width = minWidth;
    $panel.style.setProperty("--side_panel--width", `${width}px`);
    repositionHelp();
  };
  $panel.open = () => {
    $panel.setAttribute("open", true);
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = 0));
    $topbarPanelButton.setAttribute("data-active", true);
    $panel.onopen?.();
    _setOpen(true);
    $panel.resize();
  };
  $panel.close = () => {
    $tooltip.hide();
    $panel.onbeforeclose?.();
    $panel.removeAttribute("open");
    $panel.style.pointerEvents = "auto";
    $topbarPanelButton.removeAttribute("data-active");
    $panel.querySelectorAll("[tabindex]").forEach(($el) => ($el.tabIndex = -1));
    repositionHelp();
    _setOpen(false);
    setTimeout(() => {
      $panel.style.pointerEvents = "";
      $panel.onclose?.();
    }, 150);
  };
  _getOpen().then((open) => {
    if (open) $panel.open();
  });

  return $panel;
}

export { Panel };
