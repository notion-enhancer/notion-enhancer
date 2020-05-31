/* === INJECTION MARKER === */

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: custom styles, nicer window control buttons

// DO NOT REMOVE THE INJECTION MARKER ABOVE

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
    console.table(store);
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
    element = document.createElement('button');
    element.classList.add('window-buttons');
    element.innerHTML = '🠛';
    element.onclick = function () {
      const state = appwindow.isAlwaysOnTop();
      appwindow.setAlwaysOnTop(!state);
      this.innerHTML = state ? '🠛' : '🠙';
    };
    node.appendChild(element);

    // minimise
    element = document.createElement('button');
    element.classList.add('window-buttons');
    element.innerHTML = '⚊';
    element.onclick = () => appwindow.minimize();
    node.appendChild(element);

    // maximise
    element = document.createElement('button');
    element.classList.add('window-buttons');
    element.innerHTML = appwindow.isMaximized() ? '🗗' : '🗖';
    element.onclick = function () {
      if (appwindow.isMaximized()) {
        appwindow.unmaximize();
        this.innerHTML = '🗖';
      } else {
        appwindow.maximize();
        this.innerHTML = '🗗';
      }
    };
    node.appendChild(element);

    // close
    const path = require('path');
    element = document.createElement('button');
    element.classList.add('window-buttons');
    element.innerHTML = '⨉';
    element.onclick = () => {
      if (
        store.tray &&
        require('electron').remote.BrowserWindow.getAllWindows().length === 1
      ) {
        appwindow.hide();
      } else appwindow.close();
    };
    node.appendChild(element);

    /* reload window */
    document.defaultView.addEventListener(
      'keyup',
      (ev) => void (ev.code === 'F5' ? appwindow.reload() : 0),
      true
    );
  }
}, 100);
