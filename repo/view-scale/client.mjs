/**
 * notion-enhancer: view scale
 * (c) 2021 SP12893678 (https://sp12893678.tk/)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ electron, web, components }, db) {
  let zoomFactor = (await db.get(['default_zoom'])) / 100,
    updateScale = () => {};
  electron.webFrame.setZoomFactor(zoomFactor);

  const zoomOffset = (await db.get(['offset'])) / 100,
    zoomMin = 0.5,
    zoomMax = 2,
    getZoomFactor = () => electron.webFrame.getZoomFactor(),
    setZoomFactor = (zoomFactor) => electron.webFrame.setZoomFactor(zoomFactor),
    zoomPlus = (multiplier = 1) => {
      zoomFactor = Math.min(getZoomFactor() + zoomOffset * multiplier, zoomMax);
      setZoomFactor(zoomFactor);
      updateScale();
    },
    zoomMinus = (multiplier = 1) => {
      zoomFactor = Math.max(getZoomFactor() - zoomOffset * multiplier, zoomMin);
      setZoomFactor(zoomFactor);
      updateScale();
    };

  const mousewheelModifier = await db.get(['mousewheel']);
  if (mousewheelModifier !== '-- none --') {
    const mousewheelModifierKey = {
      Control: 'ctrlKey',
      Alt: 'altKey',
      Command: 'metaKey',
      Shift: 'shiftKey',
    }[mousewheelModifier];
    document.addEventListener('wheel', (event) => {
      if (event[mousewheelModifierKey] && event.deltaY < 0) zoomPlus();
      if (event[mousewheelModifierKey] && event.deltaY > 0) zoomMinus();
    });
  }

  const showVisualSlider = await db.get(['ui']);
  if (showVisualSlider) {
    const topbarActionsSelector =
      '.notion-topbar-action-buttons > div[style="display: flex;"]';
    await web.whenReady([topbarActionsSelector]);

    const $topbarActions = document.querySelector(topbarActionsSelector),
      $scaleContainer = web.html`<div class="view_scale--container"></div>`,
      $scaleSlider = web.html`<input class="view_scale--slider" type="range" min="50" max="200" value="100"></input>`,
      $scaleCounter = web.html`<span class="view_scale--counter">100%</span>`,
      $scalePlus = web.html`<button class="view_scale--button">
        ${await components.feather('zoom-in')}
      </button>`,
      $scaleMinus = web.html`<button class="view_scale--button">
        ${await components.feather('zoom-out')}
      </button>`;
    components.addTooltip($scalePlus, '**Zoom into the window**');
    components.addTooltip($scaleMinus, '**Zoom out of the window**');
    updateScale = () => {
      if (getZoomFactor() !== zoomFactor) zoomFactor = getZoomFactor();
      $scaleSlider.value = Math.round(zoomFactor * 100);
      $scaleCounter.innerHTML = Math.round(zoomFactor * 100) + '%';
    };
    updateScale();

    $scaleSlider.addEventListener('input', () => {
      zoomFactor = $scaleSlider.value / 100;
      $scaleCounter.innerHTML = Math.round(zoomFactor * 100) + '%';
    });
    $scaleSlider.addEventListener('change', () => setZoomFactor(zoomFactor));
    $scalePlus.addEventListener('click', () => zoomPlus());
    $scaleMinus.addEventListener('click', () => zoomMinus());

    $topbarActions.prepend(
      web.render($scaleContainer, $scaleSlider, $scaleCounter, $scalePlus, $scaleMinus)
    );

    web.addHotkeyListener(['Ctrl', '+'], updateScale);
    web.addHotkeyListener(['Ctrl', '-'], updateScale);
    web.addHotkeyListener(['Ctrl', '0'], updateScale);
    web.addHotkeyListener(['Command', '+'], updateScale);
    web.addHotkeyListener(['Command', '-'], updateScale);
    web.addHotkeyListener(['Command', '0'], updateScale);
  }
}
