/* === INJECTION MARKER === */

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: custom styles, nicer window control buttons

// DO NOT REMOVE THE MARKERS ABOVE.

require('electron').remote.getGlobal('setTimeout')(() => {
  const fs = require('fs'),
    path = require('path'),
    store = require(path.join(__dirname, '..', 'store.js'))({
      config: 'user-preferences',
      defaults: {
        openhidden: false,
        maximized: false,
        tray: false,
        theme: false,
      },
    }),
    isMac = process.platform === 'darwin';

  const intervalID = setInterval(injection, 100);
  function injection() {
    if (document.querySelector('div.notion-topbar > div') == undefined) return;
    clearInterval(intervalID);

    /* style injection */
    const head = document.getElementsByTagName('head')[0],
      css = ['user'];
    if (store.theme) css.push('theme');
    css.forEach((file) => {
      file = fs.readFileSync(`☃☃☃resources☃☃☃/${file}.css`); // will be set by python script
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = file;
      head.appendChild(style);
    });
    document.body.classList.add('enhanced');

    const appwindow = require('electron').remote.getCurrentWindow();

    /* titlebar */
    const buttons = document.createElement('span'),
      dragarea = document.createElement('div');
    dragarea.className = 'window-dragarea';
    document.querySelector('.notion-topbar').prepend(dragarea);
    buttons.className = 'window-buttons-area';
    buttons.innerHTML = `
      <button class="window-button btn-alwaysontop"></button>
    `;
    if (!isMac)
      buttons.innerHTML += `
        <button class="window-button btn-minimize"></button>
        <button class="window-button btn-maximize"></button>
        <button class="window-button btn-close"></button>
      `;
    document
      .querySelector('.notion-topbar > div[style*="display: flex"]')
      .appendChild(buttons);
    document
      .querySelector('.notion-history-back-button')
      .parentElement.nextElementSibling.classList.add(
        'notion-topbar-breadcrumb'
      );
    document
      .querySelector('.notion-topbar-share-menu')
      .parentElement.classList.add('notion-topbar-actions');

    const button_icons_raw = {
        alwaysontop_on: fs.readFileSync(
          '☃☃☃resources☃☃☃/icons/alwaysontop_on.svg'
        ),
        alwaysontop_off: fs.readFileSync(
          '☃☃☃resources☃☃☃/icons/alwaysontop_off.svg'
        ),
        minimize: fs.readFileSync('☃☃☃resources☃☃☃/icons/minimise.svg'),
        maximize_on: fs.readFileSync('☃☃☃resources☃☃☃/icons/maximise_on.svg'),
        maximize_off: fs.readFileSync('☃☃☃resources☃☃☃/icons/maximise_off.svg'),
        close: fs.readFileSync('☃☃☃resources☃☃☃/icons/close.svg'),
      },
      button_icons = {
        alwaysontop() {
          return appwindow.isAlwaysOnTop()
            ? button_icons_raw.alwaysontop_on
            : button_icons_raw.alwaysontop_off; // '🠙' : '🠛'
        },
        minimize() {
          return button_icons_raw.minimize; // '⚊'
        },
        maximize() {
          return appwindow.isMaximized()
            ? button_icons_raw.maximize_on
            : button_icons_raw.maximize_off; // '🗗' : '🗖'
        },
        close() {
          return button_icons_raw.close; // '⨉'
        },
      },
      button_actions = {
        alwaysontop() {
          appwindow.setAlwaysOnTop(!appwindow.isAlwaysOnTop());
          this.innerHTML = button_icons.alwaysontop();
        },
        minimize() {
          appwindow.minimize();
        },
        maximize() {
          appwindow.isMaximized()
            ? appwindow.unmaximize()
            : appwindow.maximize();
          this.innerHTML = button_icons.maximize();
        },
        close(event = null) {
          if (
            store.tray &&
            require('electron').remote.BrowserWindow.getAllWindows().length ===
              1
          ) {
            if (event) event.preventDefault();
            appwindow.hide();
          } else appwindow.close();
        },
      },
      button_elements = {
        alwaysontop: document.querySelector('.window-button.btn-alwaysontop'),
        minimize: document.querySelector('.window-button.btn-minimize'),
        maximize: document.querySelector('.window-button.btn-maximize'),
        close: document.querySelector('.window-button.btn-close'),
      };

    button_elements.alwaysontop.innerHTML = button_icons.alwaysontop();
    button_elements.alwaysontop.onclick = button_actions.alwaysontop;

    if (!isMac) {
      button_elements.minimize.innerHTML = button_icons.minimize();
      button_elements.minimize.onclick = button_actions.minimize;

      button_elements.maximize.innerHTML = button_icons.maximize();
      button_elements.maximize.onclick = button_actions.maximize;
      setInterval(() => {
        if (button_elements.maximize.innerHTML != button_icons.maximize())
          button_elements.maximize.innerHTML = button_icons.maximize();
      }, 1000);

      button_elements.close.innerHTML = button_icons.close();
      button_elements.close.onclick = button_actions.close;
    }

    /* hotkey: reload window */
    document.defaultView.addEventListener(
      'keyup',
      (ev) => void (ev.code === 'F5' ? appwindow.reload() : 0),
      true
    );
  }
}, 100);
