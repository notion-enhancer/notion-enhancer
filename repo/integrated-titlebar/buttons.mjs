/*
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export const createWindowButtons = async ({ web, components }, db) => {
  let minimizeIcon = (await db.get(['minimize_icon'])) || (await components.feather('minus')),
    maximizeIcon = (await db.get(['maximize_icon'])) || (await components.feather('maximize')),
    unmaximizeIcon =
      (await db.get(['unmaximize_icon'])) || (await components.feather('minimize')),
    closeIcon = await db.get(['close_icon'], await components.feather('x'));
  minimizeIcon = minimizeIcon.trim();
  maximizeIcon = maximizeIcon.trim();
  unmaximizeIcon = unmaximizeIcon.trim();
  closeIcon = closeIcon.trim();

  minimizeIcon =
    minimizeIcon.startsWith('<svg') && minimizeIcon.endsWith('</svg>')
      ? minimizeIcon
      : web.escape(minimizeIcon);
  maximizeIcon =
    maximizeIcon.startsWith('<svg') && maximizeIcon.endsWith('</svg>')
      ? maximizeIcon
      : web.escape(maximizeIcon);
  unmaximizeIcon =
    unmaximizeIcon.startsWith('<svg') && unmaximizeIcon.endsWith('</svg>')
      ? unmaximizeIcon
      : web.escape(unmaximizeIcon);
  closeIcon =
    closeIcon.startsWith('<svg') && closeIcon.endsWith('</svg>')
      ? closeIcon
      : web.escape(closeIcon);

  const $windowButtons = web.html`<div class="integrated_titlebar--buttons"></div>`,
    $minimize = web.html`<button id="integrated_titlebar--minimize">
      ${minimizeIcon}
    </button>`,
    $maximize = web.html`<button id="integrated_titlebar--maximize">
      ${maximizeIcon}
    </button>`,
    $unmaximize = web.html`<button id="integrated_titlebar--unmaximize">
      ${unmaximizeIcon}
    </button>`,
    $close = web.html`<button id="integrated_titlebar--close">
      ${closeIcon}
    </button>`;

  $minimize.addEventListener('click', () => __enhancerElectronApi.browser.minimize());
  $maximize.addEventListener('click', () => __enhancerElectronApi.browser.maximize());
  $unmaximize.addEventListener('click', () => __enhancerElectronApi.browser.unmaximize());
  $close.addEventListener('click', () => __enhancerElectronApi.browser.close());
  __enhancerElectronApi.browser.on('maximize', () => {
    $maximize.replaceWith($unmaximize);
  });
  __enhancerElectronApi.browser.on('unmaximize', () => {
    $unmaximize.replaceWith($maximize);
  });

  web.render(
    $windowButtons,
    $minimize,
    __enhancerElectronApi.browser.isMaximized() ? $unmaximize : $maximize,
    $close
  );
  return $windowButtons;
};
