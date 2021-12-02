/*
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports, __eval) {
  const dragareaSelector = '[style*="-webkit-app-region: drag;"]';

  await new Promise((res, rej) => {
    let isReadyInt;
    isReadyInt = setInterval(isReadyTest, 100);
    function isReadyTest() {
      if (document.querySelector(dragareaSelector)) {
        clearInterval(isReadyInt);
        res(true);
      }
    }
    isReadyTest();
  });

  const tilingMode = await db.get(['tiling']),
    dragareaHeight = await db.get(['dragarea_height']);

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
};
