/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web, fs, registry, markdown } from '../../helpers.js';

for (let mod of await registry.get()) {
  for (let sheet of mod.css?.menu || []) {
    web.loadStyleset(`repo/${mod._dir}/${sheet}`);
  }
}

// why a tagged template? because it syntax highlights
// https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
const html = (html, ...templates) =>
  html.map((str) => str + (templates.shift() || '')).join('');

const components = {};
components.card = {
  preview: ({ preview = '' }) =>
    web.createElement(html`<img
      alt=""
      class="library--preview"
      src="${web.htmlEscape(preview)}"
    />`),
  name: ({ name, id, version }) =>
    web.createElement(html`<label
      for="enable--${web.htmlEscape(id)}"
      class="library--title library--toggle_label"
    >
      <input type="checkbox" id="enable--${web.htmlEscape(id)}" />
      <h2>
        <span>
          ${web.htmlEscape(name)}
          <span class="library--version">v${web.htmlEscape(version)}</span>
        </span>
        <span class="library--toggle"></span>
      </h2>
    </label>`),
  tags: ({ tags = [] }) =>
    web.createElement(html`<ul class="library--tags">
      ${tags.map((tag) => html`<li>#${web.htmlEscape(tag)}</li>`).join('')}
    </ul>`),
  description: ({ description }) =>
    web.createElement(
      html`<p class="library--description">${markdown.renderInline(description)}</p>`
    ),
  authors: ({ authors }) =>
    web.createElement(html`<ul class="library--authors">
      ${authors
        .map(
          (author) =>
            html`<li>
              <a href="${web.htmlEscape(author.url)}">
                <img src="${web.htmlEscape(author.icon)}" />
                <span>${web.htmlEscape(author.name)}</span>
              </a>
            </li>`
        )
        .join('')}
    </ul>`),
  expand: async ({ id }) =>
    web.createElement(
      html`<p class="library--expand">
        <a href="?view=mod&id=${web.htmlEscape(id)}">
          <span>${await fs.getText('icons/fontawesome/long-arrow-alt-right.svg')}</span>
          <span>settings & documentation</span>
        </a>
      </p>`
    ),
  async _generate(mod) {
    const card = web.createElement(html`<article class="library--card"></article>`),
      body = web.createElement(html`<div></div>`);
    card.append(this.preview(mod));
    body.append(this.name(mod));
    body.append(this.tags(mod));
    body.append(this.description(mod));
    body.append(this.authors(mod));
    body.append(await this.expand(mod));
    card.append(body);
    return card;
  },
};
components.options = {
  toggle: (id, { key, label, value }) =>
    web.createElement(html`<label
      for="toggle--${web.htmlEscape(`${id}.${key}`)}"
      class="library--toggle_label"
    >
      <input type="checkbox" id="toggle--${web.htmlEscape(`${id}.${key}`)}" />
      <p><span>${label}</span><span class="library--toggle"></span></p
    ></label>`),
  select: async (id, { key, label, values }) =>
    web.createElement(html`<label
      for="select--${web.htmlEscape(`${id}.${key}`)}"
      class="library--select_label"
    >
      <p>${label}</p>
      <p class="library--select">
        <span> ${await fs.getText('icons/fontawesome/caret-down.svg')}</span>
        <select id="select--${web.htmlEscape(`${id}.${key}`)}">
          ${values.map(
            (value) =>
              html`<option value="${web.htmlEscape(value)}">${web.htmlEscape(value)}</option>`
          )}
        </select>
      </p>
    </label>`),
  text(id, { key, label, value }) {
    const opt = web.createElement(html`<label
      for="text--${web.htmlEscape(`${id}.${key}`)}"
      class="library--text_label"
    >
      <p>${label}</p>
      <textarea id="text--${web.htmlEscape(`${id}.${key}`)}" rows="1"></textarea>
    </label>`);
    opt.querySelector('textarea').addEventListener('input', (ev) => {
      ev.target.style.removeProperty('--txt--scroll-height');
      ev.target.style.setProperty('--txt--scroll-height', ev.target.scrollHeight + 'px');
    });
    return opt;
  },
  number: (id, { key, label, value }) =>
    web.createElement(html`<label
      for="number--${web.htmlEscape(`${id}.${key}`)}"
      class="library--number_label"
    >
      <p>${web.htmlEscape(label)}</p>
      <input id="number--${web.htmlEscape(`${id}.${key}`)}" type="number" />
    </label>`),

  async file(id, { key, label, extensions }) {
    const opt = web.createElement(html`<label
      for="file--${web.htmlEscape(`${id}.${key}`)}"
      class="library--file_label"
    >
      <input
        type="file"
        id="file--${web.htmlEscape(`${id}.${key}`)}"
        ${web.htmlEscape(
          extensions && extensions.length
            ? ` accept="${web.htmlEscape(extensions.join(','))}"`
            : ''
        )}
      />
      <p>${web.htmlEscape(label)}</p>
      <p class="library--file">
        <span>${await fs.getText('icons/fontawesome/file.svg')}</span>
        <span class="library--file_path">choose file...</span>
      </p>
    </label>`);
    opt.querySelector('input').addEventListener('change', (ev) => {
      opt.querySelector('.library--file_path').innerText = ev.target.files[0].name;
    });
    return opt;
  },
  async _generate(mod) {
    const card = await components.card._generate(mod);
    card.querySelector('.library--expand').remove();
    if (mod.options && mod.options.length) {
      const options = web.createElement(html`<div class="library--options"></div>`),
        inputs = await Promise.all(mod.options.map((opt) => this[opt.type](mod.id, opt)));
      inputs.forEach((opt) => options.append(opt));
      card.append(options);
    }
    return card;
  },
};
components.documentation = {
  buttons: async ({ _dir }) =>
    web.createElement(html`<p class="documentation--buttons">
      <a href="?view=library">
        <span>${await fs.getText('icons/fontawesome/long-arrow-alt-left.svg')}</span>
        <span>back to library</span>
      </a>
      <a
        href="https://github.com/notion-enhancer/extension/tree/main/repo/${encodeURIComponent(
          _dir
        )}"
      >
        <span>${await fs.getText('icons/fontawesome/code.svg')}</span>
        <span>view source code</span>
      </a>
    </p>`),
  readme: async (mod) =>
    web.createElement(html`<article class="documentation--body">
      ${(await fs.isFile(`repo/${mod._dir}/README.md`))
        ? markdown.render(await fs.getText(`repo/${mod._dir}/README.md`))
        : ''}
    </article>`),
};
const views = {
  $container: document.querySelector('[data-container]'),
  _router(event) {
    event.preventDefault();
    let anchor,
      i = 0;
    do {
      anchor = event.path[i];
      i++;
    } while (anchor.nodeName !== 'A');
    if (location.search !== anchor.getAttribute('href')) {
      window.history.pushState({}, '', anchor.href);
      this._load();
    }
  },
  _reset() {
    document
      .querySelectorAll('a[href^="?"]')
      .forEach((a) => a.removeEventListener('click', this._router));
    this.$container.style.opacity = 0;
    return new Promise((res, rej) => {
      setTimeout(() => {
        this.$container.innerHTML = '';
        this.$container.style.opacity = '';
        this.$container.dataset.container = '';
        document.querySelector('[data-target][data-active]')?.removeAttribute('data-active');
        res();
      }, 200);
    });
  },
  async _load() {
    await this._reset();

    const search = new Map(
      location.search
        .slice(1)
        .split('&')
        .map((query) => query.split('='))
    );
    switch (search.get('view')) {
      case 'alerts':
        await this.alerts();
        break;
      case 'mod':
        const mod = (await registry.get()).find((mod) => mod.id === search.get('id'));
        if (mod) {
          await this.mod(mod);
          break;
        }
      case 'library':
        await this.library();
        break;
      default:
        window.history.replaceState({}, '', '?view=library');
        return this._load();
    }

    document
      .querySelectorAll('img')
      .forEach((img) => (img.onerror = (ev) => ev.target.remove()));
    document
      .querySelectorAll('a[href^="?"]')
      .forEach((a) => a.addEventListener('click', this._router));
  },
  async alerts() {
    this.$container.dataset.container = 'alerts';
    document.querySelector('header [data-target="alerts"]').dataset.active = true;
    for (let mod of await registry.get())
      this.$container.append(await components.card._generate(mod));
  },
  async mod(mod) {
    this.$container.dataset.container = 'mod';
    document.querySelector('header [data-target="library"]').dataset.active = true;
    this.$container.append(await components.documentation.buttons(mod));
    this.$container.append(await components.options._generate(mod));
    this.$container.append(await components.documentation.readme(mod));
  },
  async library() {
    this.$container.dataset.container = 'library';
    document.querySelector('header [data-target="library"]').dataset.active = true;
    for (let mod of await registry.get())
      this.$container.append(await components.card._generate(mod));
  },
};
views._router = views._router.bind(views);
views._load();
window.addEventListener('popstate', (ev) => views._load());

function theme() {
  chrome.storage.local.get(['notion.theme'], (result) => {
    document.documentElement.className = `notion-${result['notion.theme'] || 'dark'}-theme`;
  });
}
window.addEventListener('focus', theme);
theme();

// registry.errors().then((err) => {
//   document.querySelector('[data-section="alerts"]').innerHTML = JSON.stringify(err);
// });
