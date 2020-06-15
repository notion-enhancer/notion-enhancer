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
        maximised: false,
        tray: false,
        theme: false,
      },
    });

  const intervalID = setInterval(injection, 100);
  function injection() {
    if (document.querySelector('div.notion-topbar > div') == undefined) return;
    clearInterval(intervalID);

    /* style injection */
    const head = document.getElementsByTagName('head')[0],
      css = ['user'];
    if (store.theme) css.push('theme');
    css.forEach((file) => {
      file = fs.readFileSync(`☃☃☃assets☃☃☃/${file}.css`); // will be set by python script
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = file;
      head.appendChild(style);
    });

    const appwindow = require('electron').remote.getCurrentWindow();

    /* window control buttons */
    let node = document.querySelector('div.notion-topbar > div'),
      element = document.createElement('div');
    element.id = 'window-buttons-area';
    node.appendChild(element);
    node = document.querySelector('#window-buttons-area');

    // always-on-top
    const alwaysontopEl = document.createElement('button');
    alwaysontopEl.classList.add('window-buttons', 'btn-alwaysontop');
    alwaysontopEl.innerHTML = '🠛';
    alwaysontopEl.onclick = function () {
      const state = appwindow.isAlwaysOnTop();
      appwindow.setAlwaysOnTop(!state);
      this.innerHTML = state ? '🠛' : '🠙';
    };
    node.appendChild(alwaysontopEl);

    // minimise
    const minimizeEl = document.createElement('button');
    minimizeEl.classList.add('window-buttons', 'btn-minimize');
    minimizeEl.innerHTML = '⚊';
    minimizeEl.onclick = () => appwindow.minimize();
    node.appendChild(minimizeEl);

    // maximise
    const maximiseEl = document.createElement('button'),
      maximiseIcon = () => (appwindow.isMaximized() ? '🗗' : '🗖');
    maximiseEl.classList.add('window-buttons', 'btn-maximize');
    maximiseEl.innerHTML = maximiseIcon();
    maximiseEl.onclick = function () {
      if (appwindow.isMaximized()) appwindow.unmaximize();
      else appwindow.maximize();
      this.innerHTML = maximiseIcon();
    };
    node.appendChild(maximiseEl);
    require('electron').remote.app.on('browser-window-focus', (event, win) => {
      if (win.id == appwindow.id) maximiseEl.innerHTML = maximiseIcon();
    });

    // close
    const closeEl = document.createElement('button');
    closeEl.classList.add('window-buttons');
    closeEl.innerHTML = '⨉';
    closeEl.onclick = () => {
      if (
        store.tray &&
        require('electron').remote.BrowserWindow.getAllWindows().length === 1
      ) {
        appwindow.hide();
      } else appwindow.close();
    };
    node.appendChild(closeEl);

    /* reload window */
    document.defaultView.addEventListener(
      'keyup',
      (ev) => void (ev.code === 'F5' ? appwindow.reload() : 0),
      true
    );
  }
}, 100);
