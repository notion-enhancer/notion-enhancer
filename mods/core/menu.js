/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const store = require('../../pkg/store.js'),
  { id } = require('./mod.js'),
  helpers = require('../../pkg/helpers.js'),
  fs = require('fs-extra'),
  path = require('path'),
  electron = require('electron'),
  browser = electron.remote.getCurrentWindow();

window['__start'] = async () => {
  const buttons = require('./buttons.js')(() => ({
    '72886371-dada-49a7-9afc-9f275ecf29d3': {
      enabled: (store('mods')['72886371-dada-49a7-9afc-9f275ecf29d3'] || {})
        .enabled,
    },
    tiling_mode: store('0f0bf8b6-eae6-4273-b307-8fc43f2ee082').tiling_mode,
    frameless: true,
  }));
  document.querySelector('#menu-titlebar').appendChild(buttons.element);

  document.defaultView.addEventListener('keyup', (event) => {
    if (event.code === 'F5') location.reload();
    const meta =
      !(event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
    if (
      meta &&
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
    } else if (
      (meta && event.key === '/') ||
      ((event.ctrlKey || event.metaKey) &&
        event.key === 'f' &&
        !event.altKey &&
        !event.shiftKey)
    )
      document.querySelector('#search > input').focus();
  });

  electron.ipcRenderer.send('enhancer:get-theme-vars');
  electron.ipcRenderer.on('enhancer:set-theme-vars', (event, theme) => {
    for (const style of theme)
      document.body.style.setProperty(style[0], style[1]);
  });

  function createAlert(type, message) {
    if (!type)
      throw Error('<notion-enhancer> @ createAlert: no alert type specified');
    const el = helpers.createElement(`
      <section class="${type}" role="alert">
        <p>${message}</p>
      </section>
    `);
    return {
      el,
      resolve() {
        el.remove();
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
             run <code>npm i -g notion-enhancer</code>`
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

  // further-configuration popup
  const $popup = document.querySelector('#popup');
  document.addEventListener('keyup', (event) => {
    if (
      $popup.classList.contains('visible') &&
      [13, 27].includes(event.keyCode)
    )
      $popup.classList.remove('visible');
  });
  let colorpicker_target = null;
  const $colorpicker = colorjoe
    .rgb('colorpicker')
    .on('change', function (color) {
      if (!colorpicker_target) return;
      colorpicker_target.elem.style.setProperty(
        '--configured--color-value',
        color.css()
      );
      store(colorpicker_target.id)[colorpicker_target.key] = color.css();
    })
    .update();

  document
    .querySelector('#colorpicker')
    .appendChild(
      helpers.createElement('<button class="close-modal"></button>')
    );
  document.querySelectorAll('#popup .close-modal').forEach((el) =>
    el.addEventListener('click', (event) => {
      $popup.classList.remove('visible');
    })
  );

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
    const el = helpers.createElement(
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
    // 'var(--theme--bg_green)'
  );
  createTag(
    'disabled',
    (state) => [(search_query.disabled = state), search()]
    // 'var(--theme--bg_red)'
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
            `$1<img alt="$2" src="$3" onerror="this.remove()">`
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
      `changes may not fully apply until <span data-relaunch>app relaunch</span>.`
    );
    modified_notice.el
      .querySelector('[data-relaunch]')
      .addEventListener('click', (event) => {
        electron.remote.app.relaunch();
        electron.remote.app.quit();
      });
    modified_notice.append();
  }

  const file_icon = await fs.readFile(
    path.resolve(`${__dirname}/icons/file.svg`)
  );
  function createOption(opt, id) {
    let $opt;
    switch (opt.type) {
      case 'toggle':
        $opt = `
          <input type="checkbox" id="${opt.type}_${id}--${opt.key}"
          ${store(id, { [opt.key]: opt.value })[opt.key] ? 'checked' : ''}/>
          <label for="${opt.type}_${id}--${opt.key}">
            <span class="name">${opt.label}</span>
            <span class="switch"><span class="dot"></span></span>
          </label>
        `;
        break;
      case 'select':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}</label>
          <select id="${opt.type}_${id}--${opt.key}">
            ${opt.value
              .map((val) => `<option value="${val}">${val}</option>`)
              .join('')}
          </select>
        `;
        break;
      case 'input':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}</label>
          <input type="${typeof value === 'number' ? 'number' : 'text'}" id="${
          opt.type
        }_${id}--${opt.key}">
        `;
        break;
      case 'color':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}</label>
          <input type="button" id="${opt.type}_${id}--${opt.key}">
        `;
        break;
      case 'file':
        $opt = `
          <input type="file" id="${opt.type}_${id}--${opt.key}"
          ${
            opt.extensions
              ? ` accept="${opt.extensions
                  .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))
                  .join(',')}"`
              : ''
          }>
          <label for="${opt.type}_${id}--${opt.key}">
            <span class="label">
              <span class="name">${opt.label}</span>
              <button class="clear"></button>
            </span>
            <span class="choose">
              ${file_icon}
              <span class="path">${
                store(id)[opt.key]
                  ? store(id)[opt.key].split(path.sep).reverse()[0]
                  : 'choose a file...'
              }</span>
            </span>
          </label>
        `;
    }
    $opt = helpers.createElement(`<p class="${opt.type}">${$opt}</p>`);
    if (opt.type === 'color') {
      $opt
        .querySelector(`#${opt.type}_${id}--${opt.key}`)
        .style.setProperty(
          '--configured--color-value',
          store(id, { [opt.key]: opt.value })[opt.key]
        );
    } else if (opt.type === 'file') {
      $opt.querySelector('.clear').addEventListener('click', (event) => {
        store(id)[opt.key] = '';
        $opt.querySelector('.path').innerText = 'choose a file...';
      });
    } else {
      $opt.querySelector(`#${opt.type}_${id}--${opt.key}`).value = store(id, {
        [opt.key]: opt.type === 'select' ? opt.value[0] : opt.value,
      })[opt.key];
    }

    return $opt;
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
    for (let fonts of mod.fonts || []) {
      document
        .querySelector('head')
        .appendChild(
          helpers.createElement(`<link rel="stylesheet" href="${fonts}">`)
        );
    }

    const enabled = store('mods', { [mod.id]: { enabled: false } })[mod.id]
        .enabled,
      author =
        typeof mod.author === 'object'
          ? mod.author
          : {
              name: mod.author,
              link: `https://github.com/${mod.author}`,
              avatar: `https://github.com/${mod.author}.png`,
            };
    mod.elem = helpers.createElement(`
      <section class="${
        mod.tags.includes('core') || enabled ? 'enabled' : 'disabled'
      }" id="${mod.id}">
        <div class="meta">
          <h3 ${
            mod.tags.includes('core')
              ? `>${mod.name}`
              : `class="toggle">
            <input type="checkbox" id="enable_${mod.id}"
            ${enabled ? 'checked' : ''} />
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
            <a href="${author.link}" class="author">
              <img src="${author.avatar}" onerror="this.src='./icons/user.png'">
              ${author.name}
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
        store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled =
          $enable.checked;
        mod.elem.className = store('mods', { [mod.id]: { enabled: false } })[
          mod.id
        ].enabled
          ? 'enabled'
          : 'disabled';
        search();
        modified();
      });

    const $options = mod.elem.querySelector('.options');
    if ($options)
      for (const opt of mod.options) {
        const $opt = createOption(opt, mod.id);
        if (opt.type === 'color') {
          const $preview = $opt.querySelector('input');
          $opt.addEventListener('click', (event) => {
            colorpicker_target = {
              id: mod.id,
              key: opt.key,
              elem: $preview,
            };
            $colorpicker.set(store(mod.id)[opt.key]);
            $popup.classList.add('visible');
          });
        } else {
          $opt
            .querySelector(`#${opt.type}_${mod.id}--${opt.key}`)
            .addEventListener('change', (event) => {
              modified();
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
                    ? +event.target.value
                    : event.target.value;
            });
        }
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
