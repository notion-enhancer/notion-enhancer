/**
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ fs, web, registry }, db, __exports, __eval) {
  const tilingMode = await db.get(['tiling']),
    dragareaHeight = await db.get(['dragarea_height']),
    tabsEnabled = await registry.enabled('e1692c29-475e-437b-b7ff-3eee872e1a42');

  if (tabsEnabled && !tilingMode) {
    await web.whenReady();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = fs.localPath('repo/integrated-titlebar/tabs.mjs');
    document.head.appendChild(script);
    web.loadStylesheet('repo/integrated-titlebar/buttons.css');
  } else {
    const dragareaSelector = '[style*="-webkit-app-region: drag;"]';
    await web.whenReady([dragareaSelector]);

    const dragarea = document.querySelector(dragareaSelector);
    dragarea.style.top = '2px';
    dragarea.style.height = tilingMode ? '0' : `${dragareaHeight}px`;

    document.getElementById('notion').addEventListener('ipc-message', (event) => {
      switch (event.channel) {
        case 'notion-enhancer:sidebar-width':
          dragarea.style.left = event.args[0];
          break;
        case 'notion-enhancer:panel-width':
          dragarea.style.right = event.args[0];
          break;
      }
    });
  }
};
