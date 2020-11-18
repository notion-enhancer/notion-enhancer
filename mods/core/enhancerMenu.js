/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const store = require('../../pkg/store.js'),
  { createElement, getEnhancements } = require('../../pkg/helpers.js'),
  fs = require('fs-extra'),
  path = require('path'),
  electron = require('electron'),
  { toKeyEvent } = require('keyboardevent-from-electron-accelerator');

window['__start'] = async () => {
  document.body.setAttribute('data-platform', process.platform);

  // mod loader
  const modules = getEnhancements();
  if (modules.loaded.length) {
    console.info(
      `<notion-enhancer> enhancements loaded: ${modules.loaded
        .map((mod) => mod.name)
        .join(', ')}.`
    );
  }
  if (modules.invalid.length) {
    createAlert(
      'error',
      `invalid mods found: ${modules.invalid
        .map((mod) => `<b>${mod}</b>`)
        .join(', ')}.`
    ).append();
  }
  const coreStore = (...args) => {
    const mod = modules.loaded.find(
      (m) => m.id === '0f0bf8b6-eae6-4273-b307-8fc43f2ee082'
    );
    return !args.length
      ? store(mod.id, mod.defaults)
      : args.length === 1 && typeof args[0] === 'object'
      ? store(mod.id, { ...mod.defaults, ...args[0] })
      : store(args[0], { ...mod.defaults, ...args[1] });
  };

  electron.ipcRenderer.send('enhancer:get-app-theme');
  electron.ipcRenderer.on('enhancer:set-app-theme', (event, theme) => {
    document.body.className = `notion-${theme}-theme`;
  });

  const buttons = require('./buttons.js')(() => ({
    '72886371-dada-49a7-9afc-9f275ecf29d3': {
      enabled: (store('mods')['72886371-dada-49a7-9afc-9f275ecf29d3'] || {})
        .enabled,
    },
    tiling_mode: coreStore().tiling_mode,
    frameless: coreStore().frameless,
  }));
  document.querySelector('#titlebar').appendChild(buttons.element);

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
    `https://api.github.com/repos/notion-enhancer/notion-enhancer/releases/latest`
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

  const $popup = document.querySelector('#popup');
  document.addEventListener('keyup', (event) => {
    if (event.key === 'F5') location.reload();
    // further-configuration popup
    if (
      $popup.classList.contains('visible') &&
      ['Enter', 'Escape'].includes(event.key)
    )
      $popup.classList.remove('visible');
    // close window on hotkey toggle
    if (coreStore().menu_toggle) {
      const hotkey = {
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        ...toKeyEvent(coreStore().menu_toggle),
      };
      let triggered = true;
      for (let prop in hotkey)
        if (
          hotkey[prop] !== event[prop] &&
          !(prop === 'key' && event[prop] === 'Dead')
        )
          triggered = false;
      if (triggered || ((event.ctrlKey || event.metaKey) && event.key === 'w'))
        electron.remote.getCurrentWindow().close();
    }
    //  focus search
    const meta =
      !(event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
    if (
      meta &&
      document.activeElement.getAttribute('tabindex') === '0' &&
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
    } else if (meta && event.key === '/')
      document.querySelector('#search > input').focus();
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === 'f' &&
      !event.altKey &&
      !event.shiftKey
    )
      document.querySelector('#search > input').focus();
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
    .appendChild(createElement('<button class="close-modal"></button>'));
  document.querySelectorAll('#popup .close-modal').forEach((el) =>
    el.addEventListener('click', (event) => {
      $popup.classList.remove('visible');
    })
  );

  const conflicts = {
    relaunch: null,
    detected: () =>
      store('mods', {
        conflicts: { dark: false, light: false },
      }).conflicts,
    alerts: [],
    check() {
      document.body.classList.remove('conflict');
      conflicts.alerts.forEach((alert) => alert.resolve());
      conflicts.alerts = [];
      const enabled = modules.loaded.filter(
          (mod) =>
            store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled &&
            mod.tags.includes('theme')
        ),
        dark = enabled.filter((mod) => mod.tags.includes('dark')),
        light = enabled.filter((mod) => mod.tags.includes('light'));
      for (let mode of [
        [dark, 'dark'],
        [light, 'light'],
      ]) {
        const conflictID = mode[0]
          .map((mod) => mod.id)
          .sort()
          .join('||');
        if (
          conflicts.detected()[mode[1]] &&
          conflicts.detected()[mode[1]][0] === conflictID &&
          conflicts.detected()[mode[1]][1]
        )
          continue;
        if (mode[0].length > 1) {
          document.body.classList.add('conflict');
          conflicts.detected()[mode[1]] = [conflictID, false];
          const alert = createAlert(
            'error',
            `conflicting ${mode[1]} themes: ${mode[0]
              .map((mod) => `<b>${mod.name}</b>`)
              .join(
                ', '
              )}. <br> resolve or <span data-action="dismiss" tabindex="0">dismiss</span> to continue.`
          );
          alert.el
            .querySelector('[data-action="dismiss"]')
            .addEventListener('click', (event) => {
              conflicts.detected()[mode[1]] = [conflictID, true];
              conflicts.check();
            });
          alert.append();
          conflicts.alerts.push(alert);
        } else conflicts.detected()[mode[1]] = false;
      }
      search();
    },
  };
  function modified() {
    conflicts.check();
    if (conflicts.relaunch) return;
    conflicts.relaunch = createAlert(
      'info',
      'changes may not fully apply until <span data-action="relaunch" tabindex="0">app relaunch</span>.'
    );
    conflicts.relaunch.el
      .querySelector('[data-action="relaunch"]')
      .addEventListener('click', (event) => {
        electron.remote.app.relaunch();
        electron.remote.app.quit();
      });
    conflicts.relaunch.append();
  }

  const search_filters = {
    enabled: true,
    disabled: true,
    tags: new Set(
      modules.loaded
        .map((mod) => mod.tags)
        .flat()
        .sort()
    ),
  };
  function innerText(elem) {
    let text = '';
    for (let $node of elem.childNodes) {
      if ($node.nodeType === 3) text += $node.textContent;
      if ($node.nodeType === 1) {
        if ($node.getAttribute('data-tooltip'))
          text += $node.getAttribute('data-tooltip');
        text += ['text', 'number'].includes($node.type)
          ? $node.value
          : innerText($node);
      }
    }
    return text;
  }
  function search() {
    modules.loaded.forEach((mod) => {
      const $search_input = document.querySelector('#search > input'),
        conflictingIDs = [conflicts.detected().dark, conflicts.detected().light]
          .filter((conflict) => conflict && !conflict[1])
          .map(([mods, dismissed]) => mods.split('||'))
          .flat();
      if (
        conflictingIDs.length ||
        document.body.classList.contains('reorder')
      ) {
        $search_input.disabled = true;
      } else $search_input.disabled = false;
      if (
        !document.body.classList.contains('reorder') &&
        (conflictingIDs.length
          ? !conflictingIDs.some((id) => id.includes(mod.id))
          : (mod.elem.classList.contains('enabled') &&
              !search_filters.enabled) ||
            (mod.elem.classList.contains('disabled') &&
              !search_filters.disabled) ||
            !mod.tags.some((tag) => search_filters.tags.has(tag)) ||
            ($search_input.value &&
              !innerText(mod.elem)
                .toLowerCase()
                .includes($search_input.value.toLowerCase().trim())))
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
      if (
        !document.body.classList.contains('reorder') &&
        !document.body.classList.contains('conflict')
      ) {
        el.className = el.className === 'selected' ? '' : 'selected';
        onclick(el.className === 'selected');
      }
    });
    return el;
  }
  createTag('enabled', (state) => [
    ((search_filters.enabled = state), search()),
  ]);
  createTag('disabled', (state) => [
    (search_filters.disabled = state),
    search(),
  ]);
  for (let tag of search_filters.tags)
    createTag(`#${tag}`, (state) => [
      state ? search_filters.tags.add(tag) : search_filters.tags.delete(tag),
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

  const file_icon = await fs.readFile(
      path.resolve(`${__dirname}/icons/file.svg`)
    ),
    question_icon = (
      await fs.readFile(path.resolve(`${__dirname}/icons/question.svg`))
    ).toString();
  function createOption(opt, id) {
    let $opt;
    const desc = opt.desc
      ? question_icon.replace(
          '<svg',
          `<svg data-tooltip="${opt.desc.replace(/"/g, '&quot;')}"`
        )
      : '';
    switch (opt.type) {
      case 'toggle':
        $opt = `
          <input type="checkbox" id="${opt.type}_${id}--${opt.key}"
          ${store(id, { [opt.key]: opt.value })[opt.key] ? 'checked' : ''}/>
          <label for="${opt.type}_${id}--${opt.key}">
            <span class="name">${opt.label}${desc}</span>
            <span class="switch"><span class="dot"></span></span>
          </label>
        `;
        break;
      case 'select':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}${desc}</label>
          <select id="${opt.type}_${id}--${opt.key}">
            ${opt.value
              .map((val) => `<option value="${val}">${val}</option>`)
              .join('')}
          </select>
        `;
        break;
      case 'input':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}${desc}</label>
          <input type="${typeof value === 'number' ? 'number' : 'text'}" id="${
          opt.type
        }_${id}--${opt.key}">
        `;
        break;
      case 'color':
        $opt = `
          <label for="${opt.type}_${id}--${opt.key}">${opt.label}${desc}</label>
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
              <span class="name">${opt.label}${desc}</span>
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
    $opt = createElement(`<p class="${opt.type}">${$opt}</p>`);
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

  const $modules = document.querySelector('#modules'),
    fileExists = (file) => fs.pathExistsSync(path.resolve(file));

  for (let mod of modules.loaded) {
    const enabled =
        mod.alwaysActive ||
        store('mods', {
          [mod.id]: { enabled: false },
        })[mod.id].enabled,
      author =
        typeof mod.author === 'object'
          ? mod.author
          : {
              name: mod.author,
              link: `https://github.com/${mod.author}`,
              avatar: `https://github.com/${mod.author}.png`,
            };
    if (enabled) {
      for (let sheet of ['menu', 'variables']) {
        if (fileExists(`${__dirname}/../${mod.dir}/${sheet}.css`)) {
          document.head.appendChild(
            createElement(
              `<link rel="stylesheet" href="enhancement://${mod.dir}/${sheet}.css">`
            )
          );
        }
      }
    }
    mod.elem = createElement(`
    <section class="${enabled ? 'enabled' : 'disabled'}${
      mod.tags.includes('core') ? ' core' : ''
    }" id="${mod.id}">
        <div class="meta">
        <h3 ${
          mod.alwaysActive
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
              mod.options && mod.options.length
                ? '<div class="options"></div>'
                : ''
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
        if (
          $enable.checked &&
          coreStore().autoresolve &&
          mod.tags.includes('theme')
        ) {
          modules.loaded.forEach((other) => {
            const $other_enable = other.elem.querySelector(
              `#enable_${other.id}`
            );
            if (
              other !== mod &&
              $other_enable &&
              $other_enable.checked &&
              other.tags.includes('theme')
            ) {
              for (let mode of ['dark', 'light'])
                if (other.tags.includes(mode) && mod.tags.includes(mode))
                  $other_enable.click();
            }
          });
        }
        search();
        modified();
      });

    const $options = mod.elem.querySelector('.options');
    if ($options)
      for (const opt of mod.options) {
        if (
          Object.keys(opt.platformOverwrite || {}).some(
            (platform) => process.platform === platform
          )
        ) {
          continue;
        }
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
    if (mod.tags.includes('core')) $modules.append(mod.elem);
  }
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) =>
      checkbox.addEventListener('click', (event) => event.target.blur())
    );
  conflicts.check();

  // draggable re-ordering
  const draggable = {
    state: 0,
    tags: ['b', 'span'],
    $toggle: document.querySelector('#draggable-toggle'),
    list: modules.loaded
      .filter((m) => !m.tags.includes('core'))
      .map((m) => m.elem),
    target: null,
    render() {
      draggable.target = null;
      for (let $node of draggable.list) {
        $node.draggable = false;
        $modules.append($node);
      }
    },
    mouseover(event) {
      if (!draggable.target && event.target.innerText) {
        for (let $node of draggable.list) $node.draggable = false;
        const $node = draggable.list.find(
          (node) => node.innerText === event.target.innerText
        );
        if ($node) $node.draggable = draggable.state;
      }
    },
  };
  document.addEventListener('dragstart', (event) => {
    draggable.target = event.target;
    event.target.style.opacity = 0.5;
  });
  document.addEventListener('dragend', (event) => {
    event.target.style.opacity = '';
  });
  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    document
      .querySelectorAll('.dragged-over')
      .forEach((el) => el.classList.remove('dragged-over'));
    const $node = [
      draggable.list[0].previousElementSibling,
      ...draggable.list,
    ].find((node) => node.innerText === event.target.innerText);
    if ($node) $node.classList.add('dragged-over');
  });
  document.addEventListener('drop', (event) => {
    event.preventDefault();
    document
      .querySelectorAll('.dragged-over')
      .forEach((el) => el.classList.remove('dragged-over'));
    if (
      draggable.target &&
      draggable.target.innerText !== event.target.innerText
    ) {
      const from = draggable.list.findIndex(
          (node) => node.innerText === draggable.target.innerText
        ),
        to =
          event.target.innerText ===
          draggable.list[0].previousElementSibling.innerText
            ? 0
            : draggable.list.findIndex(
                (node) => node.innerText === event.target.innerText
              ) + 1;
      if (to >= 0) {
        draggable.list.splice(
          to > from ? to - 1 : to,
          0,
          draggable.list.splice(from, 1)[0]
        );
        store('mods').priority = draggable.list.map((m) => m.id);
      }
    }
    draggable.render();
    modified();
  });
  document.addEventListener('mouseover', draggable.mouseover);
  draggable.render();
  draggable.$toggle.addEventListener('click', (event) => {
    draggable.state = !draggable.state;
    draggable.tags = draggable.tags.reverse();
    draggable.$toggle.innerHTML = `
      <${draggable.tags[0]} data-bolded="configure">configure</${draggable.tags[0]}> |
      <${draggable.tags[1]} data-bolded="reorder">reorder</${draggable.tags[1]}>
      `;
    document.body.classList[draggable.state ? 'add' : 'remove']('reorder');
    $modules
      .querySelectorAll('input')
      .forEach((input) => (input.disabled = draggable.state));
    search();
  });

  const $tooltip = document.querySelector('#tooltip');
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('mouseenter', (e) => {
      $tooltip.innerText = el.getAttribute('data-tooltip');
      $tooltip.classList.add('active');
    });
    el.addEventListener('mouseover', (e) => {
      $tooltip.style.top = e.clientY - $tooltip.clientHeight + 'px';
      $tooltip.style.left =
        e.clientX < window.innerWidth / 2 ? e.clientX + 'px' : '';
      $tooltip.style.right =
        e.clientX > window.innerWidth / 2
          ? window.innerWidth - e.clientX + 'px'
          : '';
    });
    el.addEventListener('mouseleave', (e) =>
      $tooltip.classList.remove('active')
    );
  });
};
