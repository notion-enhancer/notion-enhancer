/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

const store = require('../../pkg/store.js'),
  helpers = require('../../pkg/helpers.js'),
  electron = require('electron'),
  browser = electron.remote.getCurrentWindow();

window['__start'] = async () => {
  const buttons = require('./buttons.js')(() => ({ frameless: true }));
  document.querySelector('#menu-titlebar').appendChild(buttons.element);

  document.defaultView.addEventListener('keyup', (event) => {
    if (event.code === 'F5') window.reload();
    if (event.key === 'e' && (event.ctrlKey || event.metaKey)) browser.close();
  });

  electron.ipcRenderer.on('enhancer:set-theme', (event, theme) => {
    document.body.className = `notion-${theme.mode}-theme`;
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
      const raw_v = require('./mod.js').version,
        version = {
          local: raw_v.split(/[~-]/g)[0],
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
          : `local build <b>v${raw_v}</b> is unstable.`
      ).prepend();
    });

  // mod loader
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

  // mod info + options
  function markdown(string) {
    const parsed = string
      .split('\n')
      .map((line) =>
        line
          .trim()
          .replace(/\s+/g, ' ')
          // > quote
          .replace(/^>\s+(.+)$/g, '<blockquote>$1</blockquote>')
          // ~~strikethrough~~
          .replace(/([^\\])?~~((?:(?!~~).)*[^\\])~~/g, '$1<s>$2</s>')
          // __underline__
          .replace(/([^\\])?__((?:(?!__).)*[^\\])__/g, '$1<u>$2</u>')
          // **bold**
          .replace(/([^\\])?\*\*((?:(?!\*\*).)*[^\\])\*\*/g, '$1<b>$2</b>')
          // *italic*
          .replace(/([^\\])?\*([^*]*[^\\*])\*/g, '$1<i>$2</i>')
          // _italic_
          .replace(/([^\\])?_([^_]*[^\\_])_/g, '$1<i>$2</i>')
          // `code`
          .replace(/([^\\])?`([^`]*[^\\`])`/g, '$1<code>$2</code>')
          // ![image_title](source)
          .replace(
            /([^\\])?\!\[([^\]]*[^\\\]]?)\]\(([^)]*[^\\)])\)/g,
            '$1<img alt="" src="$3">$2</img>'
          )
          // [link](destination)
          .replace(
            /([^\\])?\[([^\]]*[^\\\]]?)\]\(([^)]*[^\\)])\)/g,
            '$1<a href="$3">$2</a>'
          )
      )
      .map((line) =>
        line.startsWith('<blockquote>') ? line : `<p>${line}</p>`
      )
      .join('');
    return parsed;
  }

  let modified_notice;
  function modified() {
    if (modified_notice) return;
    modified_notice = createAlert(
      'info',
      `changes may not apply until app restart.`
    );
    modified_notice.append();
  }

  const $modules = document.querySelector('#modules');
  for (let mod of modules.loaded.sort((a, b) =>
    a.tags.includes('core') ||
    store('mods', { [a.id]: { pinned: false } }).pinned
      ? -1
      : b.tags.includes('core') ||
        store('mods', { [b.id]: { pinned: false } }).pinned
      ? 1
      : a.name.localeCompare(b.name)
  )) {
    const menuStore = store('mods', { [mod.id]: { enabled: false } });
    mod.elem = createElement(`
      <section class="${
        mod.tags.includes('core') || menuStore[mod.id].enabled
          ? 'enabled'
          : 'disabled'
      }" id="${mod.id}">
        <div class="meta">
          <h3 ${
            mod.tags.includes('core')
              ? `>${mod.name}`
              : `class="toggle">
            <input type="checkbox" id="enable_${mod.id}"
            ${menuStore[mod.id].enabled ? 'checked' : ''} />
            <label for="enable_${mod.id}">
              <span class="name">${mod.name}</span>
              <span class="switch"><span class="dot"></span></span>
            </label>`
          }</h3>
          <p class="tags">${mod.tags
            .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
            .join(' ')}</p>
          <div class="desc">${markdown(mod.desc)}</div>
          <p>
            <a href="https://github.com/${mod.author}" class="author">
              <img src="https://github.com/${mod.author}.png" />
              ${mod.author}
            </a>
            <span class="version">v${mod.version}</span>
          </p>
        </div>
        ${
          mod.options && mod.options.length ? '<div class="options"></div>' : ''
        }
      </section>
    `);
    const $enable = mod.elem.querySelector(`#enable_${mod.id}`);
    if ($enable)
      $enable.addEventListener('click', (event) => {
        menuStore[mod.id].enabled = $enable.checked;
        mod.elem.className = menuStore[mod.id].enabled ? 'enabled' : 'disabled';
      });
    const $options = mod.elem.querySelector('.options');
    if ($options)
      for (const opt of mod.options) {
        let $opt;
        switch (opt.type) {
          case 'toggle':
            $opt = createElement(`
              <p class="toggle">
                <input type="checkbox" id="toggle_${mod.id}--${opt.key}"
                ${store(mod.id)[opt.key] ? 'checked' : ''} />
                <label for="toggle_${mod.id}--${opt.key}">
                  <span class="name">${opt.label}</span>
                  <span class="switch"><span class="dot"></span></span>
                </label>
              </p>
            `);
            const $opt_checkbox = $opt.querySelector(
              `#toggle_${mod.id}--${opt.key}`
            );
            $opt_checkbox.addEventListener('change', (event) => {
              store(mod.id)[opt.key] = $opt_checkbox.checked;
              modified();
            });
            $options.appendChild($opt);
            break;
          case 'select':
            $opt = createElement(`
              <p class="select">
                <label for="select_${mod.id}--${opt.key}">${opt.label}</label>
                <select id="select_${mod.id}--${opt.key}">
                  ${opt.value
                    .map((val) => `<option value="${val}">${val}</option>`)
                    .join('')}
                </select>
              </p>
            `);
            const $opt_select = $opt.querySelector(
              `#select_${mod.id}--${opt.key}`
            );
            $opt_select.value = store(mod.id)[opt.key];
            $opt_select.addEventListener('change', (event) => {
              store(mod.id)[opt.key] = $opt_select.value;
              modified();
            });
            $options.appendChild($opt);
            break;
          case 'input':
            break;
          case 'file':
            break;
        }
      }
    $modules.append(mod.elem);
  }
};
