/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = 'a6621988-551d-495a-97d8-3c568bca2e9e';
import { env, storage, web, fmt, fs, registry, regexers } from '../../api/_.mjs';

document.querySelector('img[data-notion]').addEventListener('click', env.focusNotion);

import * as router from './router.js';

const components = {};
components.card = async (mod) => {
  const $card = web.createElement(web.html`
  <article class="library--card" data-mod='${mod.id}'>
  ${
    mod.preview
      ? web.html`<img
          alt=""
          class="library--preview"
          src="${web.escapeHtml(mod.preview)}"
        />`
      : ''
  }
  <div>
    <label
      for="enable--${web.escapeHtml(mod.id)}"
      class="library--title library--toggle_label"
    >
      <input type="checkbox" id="enable--${web.escapeHtml(mod.id)}"
      ${(await registry.isEnabled(mod.id)) ? 'checked' : ''}/>
      <h2>
        <span>
          ${web.escapeHtml(mod.name)}
          <span class="library--version">v${web.escapeHtml(mod.version)}</span>
        </span>
        ${
          registry.CORE.includes(mod.id) ? '' : web.html`<span class="library--toggle"></span>`
        }
      </h2>
    </label>
    <ul class="library--tags">
      ${mod.tags.map((tag) => web.html`<li>#${web.escapeHtml(tag)}</li>`).join('')}
    </ul>
    <p class="library--description markdown">${fmt.md.renderInline(mod.description)}</p>
    <ul class="library--authors">
      ${mod.authors
        .map(
          (author) =>
            web.html`
            <li>
              <a href="${web.escapeHtml(author.url)}">
                <img alt="" src="${web.escapeHtml(author.icon)}" />
                <span>${web.escapeHtml(author.name)}</span>
              </a>
            </li>`
        )
        .join('')}
    </ul>
    <p class="library--expand">
      <a href="?view=mod&id=${web.escapeHtml(mod.id)}">
        <span><i data-icon="fa/solid/long-arrow-alt-right"></i></span>
        <span>settings & documentation</span>
      </a>
    </p>
  </div>
  </article>`);
  $card.querySelector('.library--title input').addEventListener('change', async (event) => {
    storage.set('_mods', mod.id, event.target.checked);
  });
  return $card;
};
components.options = {
  async toggle(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label
        for="toggle--${web.escapeHtml(`${id}.${key}`)}"
        class="library--toggle_label"
      >
        <input type="checkbox" id="toggle--${web.escapeHtml(`${id}.${key}`)}"
        ${state ? 'checked' : ''}/>
        <p>
          <span data-tooltip>${web.escapeHtml(label)}
          ${tooltip ? web.html`<i data-icon="fa/solid/question-circle"></i>` : ''}</span>
          <span class="library--toggle"></span>
        </p>
      </label>`);
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.checked));
    if (tooltip) web.addTooltip(opt.querySelector('[data-tooltip]'), tooltip);
    return opt;
  },
  async select(id, { key, label, tooltip, values }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label
        for="select--${web.escapeHtml(`${id}.${key}`)}"
        class="library--select_label"
      >
        <p><span data-tooltip>${web.escapeHtml(label)}
        ${tooltip ? web.html`<i data-icon="fa/solid/question-circle"></i>` : ''}</span></p>
        <p class="library--select">
          <span><i data-icon="fa/solid/caret-down"></i></span>
          <select id="select--${web.escapeHtml(`${id}.${key}`)}">
            ${values.map(
              (value) =>
                web.html`<option value="${web.escapeHtml(value)}"
                ${value === state ? 'selected' : ''}>
                ${web.escapeHtml(value)}</option>`
            )}
          </select>
        </p>
      </label>`);
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.value));
    if (tooltip) web.addTooltip(opt.querySelector('[data-tooltip]'), tooltip);
    return opt;
  },
  async text(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label
        for="text--${web.escapeHtml(`${id}.${key}`)}"
        class="library--text_label"
      >
        <p><span data-tooltip>${web.escapeHtml(label)}
        ${tooltip ? web.html`<i data-icon="fa/solid/question-circle"></i>` : ''}</span></p>
        <textarea id="text--${web.escapeHtml(`${id}.${key}`)}"
        rows="1">${web.escapeHtml(state)}</textarea>
      </label>`);
    opt.querySelector('textarea').addEventListener('input', (event) => {
      event.target.style.removeProperty('--txt--scroll-height');
      event.target.style.setProperty(
        '--txt--scroll-height',
        event.target.scrollHeight + 1 + 'px'
      );
    });
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.value));
    if (tooltip) web.addTooltip(opt.querySelector('[data-tooltip]'), tooltip);
    return opt;
  },
  async number(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label
        for="number--${web.escapeHtml(`${id}.${key}`)}"
        class="library--number_label"
      >
        <p><span data-tooltip>${web.escapeHtml(label)}
        ${tooltip ? web.html`<i data-icon="fa/solid/question-circle"></i>` : ''}</span></p>
        <input id="number--${web.escapeHtml(`${id}.${key}`)}"
        type="number" value="${web.escapeHtml(state.toString())}"/>
      </label>`);
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.value));
    if (tooltip) web.addTooltip(opt.querySelector('[data-tooltip]'), tooltip);
    return opt;
  },
  async color(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label for="color--${web.escapeHtml(`${id}.${key}`)}" class="library--color_label">
        <p class="library--color_title">
        <span data-tooltip>${web.escapeHtml(label)}
          <i data-icon="fa/solid/question-circle"></i>
        </span>
        <p class="library--color">
          <span><i data-icon="fa/solid/eye-dropper"></i></span>
          <input type="text" id="color--${web.escapeHtml(`${id}.${key}`)}"/>
        </p>
      </label>`);
    const $fill = opt.querySelector('input'),
      paintInput = () => {
        $fill.style.background = picker.toBackground();
        $fill.style.color = picker.isLight() ? '#000' : '#fff';
      },
      picker = new fmt.JSColor($fill, {
        value: state,
        previewSize: 0,
        borderRadius: 3,
        borderColor: 'var(--theme--divider)',
        controlBorderColor: 'var(--theme--divider)',
        backgroundColor: 'var(--theme--page)',
        onInput() {
          paintInput();
        },
        onChange() {
          paintInput();
          storage.set(id, key, this.toRGBAString());
        },
      });
    paintInput();
    opt.addEventListener('click', (event) => {
      picker.show();
    });
    if (tooltip) web.addTooltip(opt.querySelector('[data-tooltip]'), tooltip);
    return opt;
  },
  async file(id, { key, label, tooltip, extensions }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`
      <label
        for="file--${web.escapeHtml(`${id}.${key}`)}"
        class="library--file_label"
      >
        <input
          type="file"
          id="file--${web.escapeHtml(`${id}.${key}`)}"
          ${web.escapeHtml(
            extensions && extensions.length
              ? ` accept=${web.escapeHtml(extensions.join(','))}`
              : ''
          )}
        />
        <p class="library--file_title"><span data-tooltip>${web.escapeHtml(label)}
        <i data-icon="fa/solid/question-circle"></i></span>
        <span class="library--file_remove"><i data-icon="fa/solid/minus"></i></span></p>
        <p class="library--file">
          <span><i data-icon="fa/solid/file"></i></span>
          <span class="library--file_path">${web.escapeHtml(state || 'choose file...')}</span>
        </p>
      </label>`);
    opt.addEventListener('change', (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      opt.querySelector('.library--file_path').innerText = file.name;
      reader.onload = (progress) => {
        storage.set(id, key, file.name);
        storage.set(id, `_file.${key}`, progress.currentTarget.result);
      };
      reader.readAsText(file);
    });
    opt.querySelector('.library--file_remove').addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        opt.querySelector('input').value = '';
        opt.querySelector('.library--file_path').innerText = 'choose file...';
        storage.set(id, key, undefined);
        storage.set(id, `_file.${key}`, undefined);
      },
      false
    );
    opt.addEventListener('click', (event) => {
      document.documentElement.scrollTop = 0;
    });
    web.addTooltip(
      opt.querySelector('[data-tooltip]'),
      `${tooltip ? `${tooltip}\n\n` : ''}**warning:** ${
        'browser extensions do not have true filesystem access, ' +
        'so file content is only saved on selection. re-select files to apply edits.'
      }`
    );
    return opt;
  },
};

const actionButtons = {
  _reloadTriggered: false,
  async reload($fragment = document) {
    let $reload = $fragment.querySelector('[data-reload]');
    if (!$reload && this._reloadTriggered) {
      $reload = web.createElement(web.html`
      <button class="action--alert" data-reload>
        <span><i data-icon="fa/solid/redo"></i></span>
        <span>reload tabs to apply changes</span>
      </button>`);
      $reload.addEventListener('click', env.reloadTabs);
      $fragment.querySelector('.action--buttons').append($reload);
      await new Promise((res, rej) => requestAnimationFrame(res));
      $reload.dataset.triggered = true;
    }
  },
  async clearFilters($fragment = document) {
    let $clearFilters = $fragment.querySelector('[data-clear-filters]');
    const search = router.getSearch();
    if (search.get('tag') || search.has('enabled') || search.has('disabled')) {
      if (!$clearFilters) {
        $clearFilters = web.createElement(web.html`
        <a class="action--alert" href="?view=library" data-clear-filters>
          <span><i data-icon="fa/solid/times"></i></span>
          <span>clear filters</span>
        </a>`);
        $fragment.querySelector('.action--buttons').append($clearFilters);
        await new Promise((res, rej) => requestAnimationFrame(res));
        $clearFilters.dataset.triggered = true;
      }
    } else if ($clearFilters) $clearFilters.remove();
  },
};
storage.addChangeListener(async (event) => {
  actionButtons._reloadTriggered = true;
  actionButtons.reload();
  router.load();

  if (event.namespace === '_mods' && event.new === true) {
    const enabledTheme = (await registry.get()).find((mod) => mod.id === event.key);
    if (
      enabledTheme.tags.includes('theme') &&
      (await storage.get(_id, 'themes.autoresolve', true))
    ) {
      for (const theme of await registry.get(
        (mod) =>
          mod.tags.includes('theme') &&
          mod.id !== enabledTheme.id &&
          ((mod.tags.includes('dark') && enabledTheme.tags.includes('dark')) ||
            (mod.tags.includes('light') && enabledTheme.tags.includes('light')))
      )) {
        if (document.body.dataset.view === 'library') {
          const $toggle = document.getElementById(`enable--${theme.id}`);
          if ($toggle.checked) $toggle.click();
        } else storage.set('_mods', theme.id, false);
      }
    }
  }
});

router.addView(
  'library',
  async () => {
    const $fragment = web.createFragment(web.html`
    <p class="action--buttons">
      <a href="?view=library&tag=theme">
        <span><i data-icon="fa/solid/palette"></i></span>
        <span>themes</span>
      </a>
      <a href="?view=library&tag=extension">
        <span><i data-icon="fa/solid/plus"></i></span>
        <span>extensions</span>
      </a>
      <a href="?view=library&enabled">
        <span><i data-icon="fa/solid/toggle-on"></i></span>
        <span>enabled</span>
      </a>
      <a href="?view=library&disabled">
        <span><i data-icon="fa/solid/toggle-off"></i></span>
        <span>disabled</span>
      </a>
    </p>`);
    for (const mod of await registry.get(
      (mod) => !mod.environments || mod.environments.includes(env.name)
    )) {
      $fragment.append(await components.card(mod));
    }
    actionButtons.reload($fragment);
    actionButtons.clearFilters($fragment);
    return $fragment;
  },
  async (search = router.getSearch()) => {
    for (const [filter, active] of [
      ['tag=theme', search.get('tag') === 'theme'],
      ['tag=extension', search.get('tag') === 'extension'],
      ['enabled', search.has('enabled')],
      ['disabled', search.has('disabled')],
    ]) {
      document
        .querySelector(`.action--buttons > [href="?view=library&${filter}"]`)
        .classList[active ? 'add' : 'remove']('action--active');
    }
    const visible = new Set();
    for (const mod of await registry.get()) {
      const isEnabled = await registry.isEnabled(mod.id),
        filterConditions =
          (search.has('tag') ? mod.tags.includes(search.get('tag')) : true) &&
          (search.has('enabled') && search.has('disabled')
            ? true
            : search.has('enabled')
            ? isEnabled
            : search.has('disabled')
            ? !isEnabled
            : true);
      if (filterConditions) visible.add(mod.id);
    }
    for (const card of document.querySelectorAll('main > .library--card'))
      card.style.display = 'none';
    for (const card of document.querySelectorAll('main > .library--card'))
      if (visible.has(card.dataset.mod)) card.style.display = '';
    actionButtons.clearFilters();
  }
);

router.addView(
  'mod',
  async () => {
    const mod = (await registry.get()).find((mod) => mod.id === router.getSearch().get('id'));
    if (!mod) return false;
    const $fragment = web.createFragment(web.html`
    <p class="action--buttons">
      <a href="?view=library">
        <span><i data-icon="fa/solid/long-arrow-alt-left"></i></span>
        <span>back to library</span>
      </a>
      <a href="https://github.com/notion-enhancer/extension/tree/main/repo/${encodeURIComponent(
        mod._dir
      )}">
        <span><i data-icon="fa/solid/code"></i></span>
        <span>view source code</span>
      </a>
    </p>`);
    const $card = await components.card(mod);
    $card.querySelector('.library--expand').remove();
    if (mod.options && mod.options.length) {
      const options = web.createElement(web.html`<div class="library--options"></div>`);
      mod.options
        .filter((opt) => !opt.environments || opt.environments.includes(env.name))
        .forEach(async (opt) =>
          options.append(await components.options[opt.type](mod.id, opt))
        );
      $card.append(options);
    }
    $fragment.append(
      $card,
      web.createElement(web.html`
      <article class="documentation--body markdown">
        ${
          (await fs.isFile(`repo/${mod._dir}/README.md`))
            ? fmt.md.render(await fs.getText(`repo/${mod._dir}/README.md`))
            : ''
        }
      </article>`)
    );
    fmt.Prism.highlightAllUnder($fragment);
    actionButtons.reload($fragment);
    return $fragment;
  },
  () => {
    if (document.querySelector('[data-mod]').dataset.mod !== router.getSearch().get('id'))
      router.load(true);
  }
);

router.setDefaultView('library');
router.load();
