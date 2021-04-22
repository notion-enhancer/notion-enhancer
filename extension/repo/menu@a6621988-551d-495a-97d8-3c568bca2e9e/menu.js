/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = 'a6621988-551d-495a-97d8-3c568bca2e9e';
import { env, storage, web, fmt, fs, registry } from '../../helpers.js';

for (let mod of await registry.get()) {
  for (let sheet of mod.css?.menu || []) {
    web.loadStyleset(`repo/${mod._dir}/${sheet}`);
  }
}

document.querySelector('img[data-target="notion"]').addEventListener('click', env.focusNotion);
web.hotkeyListener(['Ctrl', 'Alt', 'E'], env.focusNotion);

const components = {};
components.card = {
  preview: ({ preview = '' }) =>
    web.createElement(web.html`<img
      alt=""
      class="library--preview"
      src="${web.escapeHtml(preview)}"
    />`),
  name: ({ name, id, version }) =>
    web.createElement(web.html`<label
      for="enable--${web.escapeHtml(id)}"
      class="library--title library--toggle_label"
    >
      <input type="checkbox" id="enable--${web.escapeHtml(id)}" />
      <h2>
        <span>
          ${web.escapeHtml(name)}
          <span class="library--version">v${web.escapeHtml(version)}</span>
        </span>
        <span class="library--toggle"></span>
      </h2>
    </label>`),
  tags: ({ tags = [] }) =>
    web.createElement(web.html`<ul class="library--tags">
      ${tags.map((tag) => web.html`<li>#${web.escapeHtml(tag)}</li>`).join('')}
    </ul>`),
  description: ({ description }) =>
    web.createElement(
      web.html`<p class="library--description markdown">${fmt.md.renderInline(
        description
      )}</p>`
    ),
  authors: ({ authors }) =>
    web.createElement(web.html`<ul class="library--authors">
      ${authors
        .map(
          (author) =>
            web.html`<li>
              <a href="${web.escapeHtml(author.url)}">
                <img alt="" src="${web.escapeHtml(author.icon)}" />
                <span>${web.escapeHtml(author.name)}</span>
              </a>
            </li>`
        )
        .join('')}
    </ul>`),
  expand: async ({ id }) =>
    web.createElement(
      web.html`<p class="library--expand">
        <a href="?view=mod&id=${web.escapeHtml(id)}">
          <span>${await fs.getText('icons/fontawesome/long-arrow-alt-right.svg')}</span>
          <span>settings & documentation</span>
        </a>
      </p>`
    ),
  async _generate(mod) {
    const card = web.createElement(web.html`<article class="library--card"></article>`),
      body = web.createElement(web.html`<div></div>`);
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
    web.createElement(web.html`<label
      for="toggle--${web.escapeHtml(`${id}.${key}`)}"
      class="library--toggle_label"
    >
      <input type="checkbox" id="toggle--${web.escapeHtml(`${id}.${key}`)}" />
      <p><span>${label}</span><span class="library--toggle"></span></p
    ></label>`),
  select: async (id, { key, label, values }) =>
    web.createElement(web.html`<label
      for="select--${web.escapeHtml(`${id}.${key}`)}"
      class="library--select_label"
    >
      <p>${label}</p>
      <p class="library--select">
        <span> ${await fs.getText('icons/fontawesome/caret-down.svg')}</span>
        <select id="select--${web.escapeHtml(`${id}.${key}`)}">
          ${values.map(
            (value) =>
              web.html`<option value="${web.escapeHtml(value)}">${web.escapeHtml(
                value
              )}</option>`
          )}
        </select>
      </p>
    </label>`),
  text(id, { key, label, value }) {
    const opt = web.createElement(web.html`<label
      for="text--${web.escapeHtml(`${id}.${key}`)}"
      class="library--text_label"
    >
      <p>${label}</p>
      <textarea id="text--${web.escapeHtml(`${id}.${key}`)}" rows="1"></textarea>
    </label>`);
    opt.querySelector('textarea').addEventListener('input', (ev) => {
      ev.target.style.removeProperty('--txt--scroll-height');
      ev.target.style.setProperty('--txt--scroll-height', ev.target.scrollHeight + 'px');
    });
    return opt;
  },
  number: (id, { key, label, value }) =>
    web.createElement(web.html`<label
      for="number--${web.escapeHtml(`${id}.${key}`)}"
      class="library--number_label"
    >
      <p>${web.escapeHtml(label)}</p>
      <input id="number--${web.escapeHtml(`${id}.${key}`)}" type="number" />
    </label>`),
  async file(id, { key, label, extensions }) {
    const opt = web.createElement(web.html`<label
      for="file--${web.escapeHtml(`${id}.${key}`)}"
      class="library--file_label"
    >
      <input
        type="file"
        id="file--${web.escapeHtml(`${id}.${key}`)}"
        ${web.escapeHtml(
          extensions && extensions.length
            ? ` accept="${web.escapeHtml(extensions.join(','))}"`
            : ''
        )}
      />
      <p>${web.escapeHtml(label)}</p>
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
      const options = web.createElement(web.html`<div class="library--options"></div>`),
        inputs = await Promise.all(mod.options.map((opt) => this[opt.type](mod.id, opt)));
      inputs.forEach((opt) => options.append(opt));
      card.append(options);
    }
    return card;
  },
};
components.documentation = {
  buttons: async ({ _dir }) =>
    web.createElement(web.html`<p class="documentation--buttons">
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
  readme: async (mod) => {
    const readme = web.createElement(web.html`<article class="documentation--body markdown">
      ${
        (await fs.isFile(`repo/${mod._dir}/README.md`))
          ? fmt.md.render(await fs.getText(`repo/${mod._dir}/README.md`))
          : ''
      }
    </article>`);
    fmt.Prism.highlightAllUnder(readme);
    return readme;
  },
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
      window.history.pushState(
        { search: anchor.getAttribute('href'), hash: '' },
        '',
        anchor.href
      );
      this._load();
    }
  },
  _navigator(event) {
    event.preventDefault();
    const hash = event.target.getAttribute('href').slice(1);
    document.getElementById(hash).scrollIntoView(true);
    document.documentElement.scrollTop = 0;
    history.replaceState({ search: location.search, hash }, null, `#${hash}`);
  },
  _reset() {
    document
      .querySelectorAll('a[href^="?"]')
      .forEach((a) => a.removeEventListener('click', this._router));
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((a) => a.removeEventListener('click', this._navigator));
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
        window.history.replaceState(
          { search: '?view=library', hash: '' },
          null,
          '?view=library'
        );
        return this._load();
    }

    setTimeout(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView(true);
      document.documentElement.scrollTop = 0;
    }, 50);
    document
      .querySelectorAll('img')
      .forEach((img) => (img.onerror = (ev) => ev.target.remove()));
    document
      .querySelectorAll('a[href^="?"]')
      .forEach((a) => a.addEventListener('click', this._router));
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((a) => a.addEventListener('click', this._navigator));
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
views._navigator = views._navigator.bind(views);
views._load();
window.addEventListener('popstate', (ev) => {
  if (ev.state) views._load();
});

async function theme() {
  document.documentElement.className = `notion-${
    (await storage.get(_id, 'theme')) || 'dark'
  }-theme`;
}
window.addEventListener('focus', theme);
theme();

// registry.errors().then((err) => {
//   document.querySelector('[data-section="alerts"]').innerHTML = JSON.stringify(err);
// });
