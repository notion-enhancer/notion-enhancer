/* === INJECTION MARKER === */

/*
 * Notion Enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: custom styles, nicer window control buttons

// DO NOT REMOVE THE INJECTION MARKER ABOVE

require('electron').remote.getGlobal('setTimeout')(() => {
  /* style injection */
  const fs = require('fs'),
    css = fs.readFileSync('$$$user.css$$$'), // will be set by python script
    style = document.createElement('style'),
    head = document.getElementsByTagName('head')[0];
  if (!head) return;
  style.type = 'text/css';
  style.innerHTML = css;
  head.appendChild(style);

  /* window control buttons */
  const intervalID = setInterval(insertbuttons, 100);
  function insertbuttons() {
    if (document.querySelector('div.notion-topbar > div') == undefined) return;

    const appwindow = require('electron').remote.getCurrentWindow();
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
    element.innerHTML = '▢';
    element.onclick = () =>
      appwindow.isMaximized() ? appwindow.unmaximize() : appwindow.maximize();
    node.appendChild(element);

    // close
    const path = require('path');
    element = document.createElement('button');
    element.classList.add('window-buttons');
    element.innerHTML = '⨉';
    element.onclick = () => {
      const store = new (require(path.join(__dirname, '..', 'store.js')))({
        config: 'user-preferences',
        defaults: {
          tray: false
        }
      });
      if (
        store.get('tray') &&
        require('electron').remote.BrowserWindow.getAllWindows().length === 1
      ) {
        appwindow.hide();
      } else appwindow.close();
    };
    node.appendChild(element);

    clearInterval(intervalID);
  }
}, 100);
