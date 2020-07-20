/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

module.exports = (defaults) =>
  function (store, __exports) {
    const __start = window['__start'],
      settings = store(defaults);

    window['__start'] = function () {
      __start();
      const dragarea = document.querySelector(
          '#root [style*="-webkit-app-region: drag"]'
        ),
        default_styles = dragarea.getAttribute('style');

      document
        .getElementById('notion')
        .addEventListener('ipc-message', (event) => {
          if (event.channel.startsWith('enhancer:sidebar-width-'))
            dragarea.setAttribute(
              'style',
              `${default_styles} height: ${settings.dragarea_height}px; left: ${
                event.channel.slice('enhancer:sidebar-width-'.length)};`
            );
        });
    };
  };
