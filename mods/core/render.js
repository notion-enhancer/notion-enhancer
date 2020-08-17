/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = (store, __exports) => {
  const __start = window['__start'];

  window['__start'] = function () {
    __start();
    const dragarea = document.querySelector(
        '#root [style*="-webkit-app-region: drag"]'
      ),
      default_styles = dragarea.getAttribute('style');

    document
      .getElementById('notion')
      .addEventListener('ipc-message', (event) => {
        if (event.channel !== 'enhancer:sidebar-width') return;
        dragarea.setAttribute(
          'style',
          `${default_styles} top: 2px; height: ${
            store().dragarea_height
          }px; left: ${event.args[0]};`
        );
      });
  };
};
