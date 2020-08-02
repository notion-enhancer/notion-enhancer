/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

const __mod = require('./mod.js'),
  store = require('../../pkg/store.js'),
  helpers = require('../../pkg/helpers.js'),
  electron = require('electron');

window['__start'] = async () => {
  const buttons = require('./buttons.js');
  document.querySelector('#menu-titlebar').appendChild(buttons.element);

  electron.ipcRenderer.on('enhancer:set-theme', (event, theme) => {
    document.body.className = `notion-${theme.mode}-theme smooth-scrollbars`;
    for (const style of theme.rules)
      document.body.style.setProperty(style[0], style[1]);
  });

  function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }
  function createAlert(type, message) {
    if (!type) throw Error('<notion-enhancer>: no alert type specified');
    const el = createElement(`
      <section class="${type}" role="alert">
        <p>${message}</p>
      </section>
    `);
    return {
      el,
      resolve() {
        el.outerHTML = '';
      },
      prepend() {
        document.querySelector('#alerts').prepend(el);
        return this;
      },
      append() {
        document.querySelector('#alerts').appendChild(el);
        return this;
      },
    };
  }

  // update checker
  fetch(
    `https://api.github.com/repos/dragonwocky/notion-enhancer/releases/latest`
  )
    .then((res) => res.json())
    .then((res) => {
      const version = {
        local: __mod.version.split(/[~-]/g)[0],
        repo: res.tag_name.slice(1),
      };
      if (version.local == version.repo) return;
      // compare func from https://github.com/substack/semver-compare
      version.sorted = [version.local, version.repo].sort((a, b) => {
        var pa = a.split('.');
        var pb = b.split('.');
        for (var i = 0; i < 3; i++) {
          var na = Number(pa[i]);
          var nb = Number(pb[i]);
          if (na > nb) return 1;
          if (nb > na) return -1;
          if (!isNaN(na) && isNaN(nb)) return 1;
          if (isNaN(na) && !isNaN(nb)) return -1;
        }
        return 0;
      });
      createAlert(
        'warning',
        version.sorted[0] == version.local
          ? `update <b>v${version.repo}</b> available!<br>
             run <code>npm i -g notion-enhancer</code><br>
             (or <code>yarn global add notion-enhancer</code>),<br>
             <u>and</u> <code>notion-enhancer apply</code>.`
          : `local build <b>v${__mod.version}</b> is unstable.`
      ).prepend();
    });

  const modules = helpers.getEnhancements();
  if (modules.loaded.length)
    console.info(
      `<notion-enhancer> enhancements loaded: ${modules.loaded
        .map((mod) => mod.name)
        .join(', ')}.`
    );
  if (modules.invalid.length) {
    createAlert(
      'error',
      `invalid mods found: ${modules.invalid
        .map((mod) => `<b>${mod}</b>`)
        .join(', ')}.`
    ).append();
  }
};
