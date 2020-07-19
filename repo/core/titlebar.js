/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

module.exports = (defaults) =>
  function (store, __exports) {
    const electron = require('electron'),
      browser = electron.remote.getCurrentWindow(),
      path = require('path'),
      fs = require('fs-extra'),
      is_mac = process.platform === 'darwin',
      settings = store(defaults);

    document.defaultView.addEventListener('keyup', (event) => {
      if (event.code === 'F5') window.reload();
      // if (event.code === 'F4' && event.altKey) window.close();
    });

    const attempt = setInterval(enhance, 500);
    async function enhance() {
      if (!document.querySelector('.notion-frame')) return;
      clearInterval(attempt);

      if (settings.smooth_scrollbars)
        document.body.classList.add('smooth-scrollbars');

      if (settings.frameless) {
        document.body.classList.add('frameless');
        const dragarea = document.createElement('div');
        dragarea.className = 'window-dragarea';
        document.querySelector('.notion-topbar').prepend(dragarea);
      }

      const buttons = {
        element: document.createElement('span'),
        insert: ['alwaysontop'],
        icons: {
          raw: {
            alwaysontop: {
              on: fs.readFile(
                path.resolve(`${__dirname}/icons/alwaysontop_on.svg`)
              ),
              off: fs.readFile(
                path.resolve(`${__dirname}/icons/alwaysontop_off.svg`)
              ),
            },
            minimize: fs.readFile(
              path.resolve(`${__dirname}/icons/minimize.svg`)
            ),
            maximize: {
              on: fs.readFile(
                path.resolve(`${__dirname}/icons/maximize_on.svg`)
              ),
              off: fs.readFile(
                path.resolve(`${__dirname}/icons/maximize_off.svg`)
              ),
            },
            close: fs.readFile(path.resolve(`${__dirname}/icons/close.svg`)),
          },
          alwaysontop() {
            return browser.isAlwaysOnTop()
              ? buttons.icons.raw.alwaysontop.on
              : buttons.icons.raw.alwaysontop.off; // '🠙' : '🠛'
          },
          minimize() {
            return buttons.icons.raw.minimize; // '⚊'
          },
          maximize() {
            return browser.isMaximized()
              ? buttons.icons.raw.maximize.on
              : buttons.icons.raw.maximize.off; // '🗗' : '🗖'
          },
          close() {
            return buttons.icons.raw.close; // '⨉'
          },
        },
        actions: {
          async alwaysontop() {
            browser.setAlwaysOnTop(!browser.isAlwaysOnTop());
            this.innerHTML = await buttons.icons.alwaysontop();
          },
          minimize() {
            browser.minimize();
          },
          async maximize() {
            browser.isMaximized() ? browser.unmaximize() : browser.maximize();
            this.innerHTML = await buttons.icons.maximize();
          },
          close(event = null) {
            if (
              settings.close_to_tray &&
              electron.remote.BrowserWindow.getAllWindows().length === 1
            ) {
              if (event) event.preventDefault();
              browser.hide();
            } else browser.close();
          },
        },
      };

      if (settings.frameless && !is_mac)
        buttons.insert.push('minimize', 'maximize', 'close');
      buttons.element.className = 'window-buttons-area';
      for (let btn of buttons.insert) {
        buttons.element.innerHTML += `<button class="window-button btn-${btn}">${await buttons.icons[
          btn
        ]()}</button>`;
      }

      document
        .querySelector('.notion-topbar > div[style*="display: flex"]')
        .appendChild(buttons.element);
      document
        .querySelector('.notion-history-back-button')
        .parentElement.nextElementSibling.classList.add(
          'notion-topbar-breadcrumb'
        );
      document
        .querySelector('.notion-topbar-share-menu')
        .parentElement.classList.add('notion-topbar-actions');

      for (let btn of buttons.insert) {
        document.querySelector(`.window-button.btn-${btn}`).onclick =
          buttons.actions[btn];
      }

      // if (!isMac) {
      //   setInterval(() => {
      //     if (button_elements.maximize.innerHTML != buttons.icons.maximize())
      //       button_elements.maximize.innerHTML = buttons.icons.maximize();
      //   }, 1000);
      // }
    }
  };
