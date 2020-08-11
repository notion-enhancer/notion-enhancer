/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const store = require('../../pkg/store.js'),
  helpers = require('../../pkg/helpers.js'),
  fs = require('fs-extra'),
  path = require('path'),
  electron = require('electron'),
  browser = electron.remote.getCurrentWindow();

window['__start'] = async () => {
  const buttons = require('./buttons.js')(() => ({ frameless: true }));
  document.querySelector('#menu-titlebar').appendChild(buttons.element);

  document.defaultView.addEventListener('keyup', (event) => {
    if (event.code === 'F5') window.reload();
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') browser.close();
    if (!(event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
      if (
        document.activeElement.parentElement.id === 'tags' &&
        event.key === 'Enter'
      )
        document.activeElement.click();
      if (document.activeElement.tagName.toLowerCase() === 'input') {
        if (document.activeElement.type === 'checkbox' && event.key === 'Enter')
          document.activeElement.checked = !document.activeElement.checked;
        if (
          ['Escape', 'Enter'].includes(event.key) &&
          document.activeElement.type !== 'checkbox' &&
          (document.activeElement.parentElement.id !== 'search' ||
            event.key === 'Escape')
        )
          document.activeElement.blur();
      } else if (event.key === '/')
        document.querySelector('#search > input').focus();
    }
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
    if (!type)
      throw Error('<notion-enhancer> @ createAlert: no alert type specified');
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
        const pa = a.split('.'),
          pb = b.split('.');
        for (let i = 0; i < 3; i++) {
          let na = Number(pa[i]),
            nb = Number(pb[i]);
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

  // search
  const search_query = {
    enabled: true,
    disabled: true,
    tags: new Set(
      modules.loaded
        .map((mod) => mod.tags)
        .flat()
        .sort()
    ),
  };
  function search() {
    modules.loaded.forEach((mod) => {
      const $search_input = document.querySelector('#search > input');
      if (
        (mod.elem.classList.contains('enabled') && !search_query.enabled) ||
        (mod.elem.classList.contains('disabled') && !search_query.disabled) ||
        !mod.tags.some((tag) => search_query.tags.has(tag)) ||
        ($search_input.value &&
          !(
            mod.name +
            mod.tags.map((tag) => `#${tag}`).join(' ') +
            mod.desc
          ).includes($search_input.value))
      )
        return (mod.elem.style.display = 'none');
      mod.elem.style.display = 'block';
    });
  }
  document.querySelector('#search > input').addEventListener('input', search);

  function createTag(tagname, onclick, color) {
    if (!tagname)
      throw Error('<notion-enhancer> @ createTag: no tagname specified');
    if (!onclick)
      throw Error('<notion-enhancer> @ createTag: no action specified');
    const el = createElement(
      `<span class="selected" ${
        color ? `style="--tag_color: ${color}" ` : ''
      }tabindex="0">${tagname}</span>`
    );
    document.querySelector('#tags').append(el);
    el.addEventListener('click', (event) => {
      el.className = el.className === 'selected' ? '' : 'selected';
      onclick(el.className === 'selected');
    });
    return el;
  }
  createTag(
    'enabled',
    (state) => [(search_query.enabled = state), search()]
    // 'var(--theme_local--bg_green)'
  );
  createTag(
    'disabled',
    (state) => [(search_query.disabled = state), search()]
    // 'var(--theme_local--bg_red)'
  );
  for (let tag of search_query.tags)
    createTag(`#${tag}`, (state) => [
      state ? search_query.tags.add(tag) : search_query.tags.delete(tag),
      search(),
    ]);

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
            `$1<img alt="$2" src="$3" onerror="this.outerHTML=''">`
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
      `changes may not fully apply until app restart.`
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
              <img src="https://github.com/${
                mod.author
              }.png" onerror="this.src='./icons/user.png'">
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
        search();
        modified();
      });

    const $options = mod.elem.querySelector('.options');
    let file_icon;
    if ($options)
      for (const opt of mod.options) {
        let $opt;
        switch (opt.type) {
          case 'toggle':
            $opt = createElement(`
              <p class="toggle">
                <input type="checkbox" id="toggle_${mod.id}--${opt.key}"
                ${
                  store(mod.id, { [opt.key]: opt.value })[opt.key]
                    ? 'checked'
                    : ''
                } />
                <label for="toggle_${mod.id}--${opt.key}">
                  <span class="name">${opt.label}</span>
                  <span class="switch"><span class="dot"></span></span>
                </label>
              </p>
            `);
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
            break;
          case 'input':
            $opt = createElement(`
              <p class="input">
                <label for="input_${mod.id}--${opt.key}">${opt.label}</label>
                <input type="${
                  typeof opt.value === 'number' ? 'number' : 'text'
                }" id="input_${mod.id}--${opt.key}">
              </p>
            `);
            break;
          case 'file':
            if (!file_icon)
              file_icon = await fs.readFile(
                path.resolve(`${__dirname}/icons/file.svg`)
              );
            $opt = createElement(`
              <p class="file">
              <input type="file" id="file_${mod.id}--${opt.key}"
              ${
                opt.extensions
                  ? ` accept="${opt.extensions
                      .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))
                      .join(',')}"`
                  : ''
              }>
                <label for="file_${mod.id}--${opt.key}">
                  <span class="label">
                    <span class="name">${opt.label}</span>
                    <button class="clear"></button>
                  </span>
                  <span class="choose">
                    ${file_icon}
                    <span class="path">${
                      store(mod.id)[opt.key]
                        ? store(mod.id)[opt.key].split(path.sep).reverse()[0]
                        : 'choose a file...'
                    }</span>
                  </span>
                </label>
              </p>
            `);
            $opt.querySelector('.clear').addEventListener('click', (event) => {
              store(mod.id)[opt.key] = '';
              $opt.querySelector('.path').innerText = store(mod.id)[opt.key]
                ? store(mod.id)[opt.key].split(path.sep).reverse()[0]
                : 'choose a file...';
            });
            break;
        }

        if (opt.type !== 'file') {
          $opt.querySelector(
            `#${opt.type}_${mod.id}--${opt.key}`
          ).value = store(mod.id, {
            [opt.key]: opt.type === 'select' ? opt.value[0] : opt.value,
          })[opt.key];
        }
        $opt
          .querySelector(`#${opt.type}_${mod.id}--${opt.key}`)
          .addEventListener('change', (event) => {
            if (opt.type === 'toggle') {
              store(mod.id)[opt.key] = event.target.checked;
            } else if (opt.type === 'file') {
              if (event.target.files.length)
                store(mod.id)[opt.key] = event.target.files[0].path;
              $opt.querySelector('.path').innerText = store(mod.id)[opt.key]
                ? store(mod.id)[opt.key].split(path.sep).reverse()[0]
                : 'choose a file...';
            } else
              store(mod.id)[opt.key] =
                typeof opt.value === 'number'
                  ? Number(event.target.value)
                  : event.target.value;
            modified();
          });
        $options.appendChild($opt);
      }
    $modules.append(mod.elem);
  }

  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) =>
      checkbox.addEventListener('click', (event) => event.target.blur())
    );
};
