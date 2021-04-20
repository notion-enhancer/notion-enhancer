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
const html = (html, ...templates) =>
  html.map((str) => str + (templates.shift() || '')).join('');

const views = {};
views.components = {
  card: {
    preview: ({ preview = '' }) =>
      web.createElement(
        html`<img
          alt=""
          class="library--preview"
          src="${web.htmlEscape(preview)}"
          onerror="this.remove()"
        />`
      ),
    name: ({ name, id, version }) =>
      web.createElement(
        html`<label
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
        </label>`
      ),
    tags: ({ tags = [] }) =>
      web.createElement(
        html`<ul class="library--tags">
          ${tags.map((tag) => html`<li>#${tag}</li>`).join('')}
        </ul>`
      ),
    description: ({ description }) =>
      html`<p class="library--description">${markdown.renderInline(description)}</p>`,
    authors: ({ authors }) =>
      html`<ul class="library--authors">
        ${authors
          .map(
            (author) =>
              html`<li>
                <a href="${author.url}"
                  ><img src="${author.icon}" /> <span>${author.name}</span></a
                >
              </li>`
          )
          .join('')}
      </ul>`,
    async expand({ id }) {
      const element = web.createElement(
        `<p class="library--expand"><a href="?mod=${id}">${await fs.getText(
          'icons/fontawesome/long-arrow-alt-right.svg'
        )}</span> <span>settings & documentation</span></a></p>`
      );
      return element;
    },
  },
  options: {
    toggle(id, { key, label, value }) {
      const element = web.createElement(`<label for="toggle--${id}.${key}" class="library--toggle_label">
      <input type="checkbox" id="toggle--${id}.${key}" />
      <p><span>${label}</span><span class="library--toggle"></span></p></label>`);
      return element;
    },
    async select(id, { key, label, values }) {
      const element = web.createElement(`<label for="select--${id}.${key}" class="library--select_label">
      <p>${label}</p><p class="library--select"><span>
      ${await fs.getText('icons/fontawesome/caret-down.svg')}</span>
      <select id="select--${id}.${key}">${values.map(
        (value) => `<option value="${value}">${value}</option>`
      )}</select></p></label>`);
      return element;
    },
    text(id, { key, label, value }) {
      const element = web.createElement(`<label for="text--${id}.${key}" class="library--text_label">
      <p>${label}</p><textarea id="text--${id}.${key}" rows="1"></textarea></label>`);
      element.querySelector('textarea').addEventListener('input', (ev) => {
        ev.target.style.removeProperty('--txt--scroll-height');
        ev.target.style.setProperty('--txt--scroll-height', ev.target.scrollHeight + 'px');
      });
      return element;
    },
    number(id, { key, label, value }) {
      const element = web.createElement(`<label for="number--${id}.${key}" class="library--number_label">
      <p>${label}</p><input id="number--${id}.${key}" type="number"></inpu></label>`);
      return element;
    },
  },
};

const components = {
    preview: ({ preview = '' }) =>
      web.createElement(
        html`<img alt="" class="library--preview" src="${preview}" onerror="this.remove()" />`
      ),
    name: ({ name, id, version }) =>
      web.createElement(`<label for="enable--${id}" class="library--title library--toggle_label">
          <input type="checkbox" id="enable--${id}" /><h2><span>${name} <span class="library--version">v${version}</span></span>
      <span class="library--toggle"></span></h2></label>`),
    tags({ tags }) {
      if (!tags || !tags.length) return '';
      const element = web.createElement(
        `<ul class="library--tags">${tags.map((tag) => `<li>#${tag}</li>`).join('')}</ul>`
      );
      return element;
    },
    description({ description }) {
      const element = web.createElement(
        `<p class="library--description">${markdown.renderInline(description)}</p>`
      );
      return element;
    },
    authors: ({ authors }) =>
      html`<ul class="library--authors">
        ${authors
          .map(
            (author) =>
              html`<li>
                <a href="${author.url}"
                  ><img src="${author.icon}" /> <span>${author.name}</span></a
                >
              </li>`
          )
          .join('')}
      </ul>`,
    async expand({ id }) {
      const element = web.createElement(
        `<p class="library--expand"><a href="?mod=${id}">${await fs.getText(
          'icons/fontawesome/long-arrow-alt-right.svg'
        )}</span> <span>settings & documentation</span></a></p>`
      );
      return element;
    },
    toggle(id, { key, label, value }) {
      const element = web.createElement(`<label for="toggle--${id}.${key}" class="library--toggle_label">
      <input type="checkbox" id="toggle--${id}.${key}" />
      <p><span>${label}</span><span class="library--toggle"></span></p></label>`);
      return element;
    },
    async select(id, { key, label, values }) {
      const element = web.createElement(`<label for="select--${id}.${key}" class="library--select_label">
      <p>${label}</p><p class="library--select"><span>
      ${await fs.getText('icons/fontawesome/caret-down.svg')}</span>
      <select id="select--${id}.${key}">${values.map(
        (value) => `<option value="${value}">${value}</option>`
      )}</select></p></label>`);
      return element;
    },
    text(id, { key, label, value }) {
      const element = web.createElement(`<label for="text--${id}.${key}" class="library--text_label">
      <p>${label}</p><textarea id="text--${id}.${key}" rows="1"></textarea></label>`);
      element.querySelector('textarea').addEventListener('input', (ev) => {
        ev.target.style.removeProperty('--txt--scroll-height');
        ev.target.style.setProperty('--txt--scroll-height', ev.target.scrollHeight + 'px');
      });
      return element;
    },
    number(id, { key, label, value }) {
      const element = web.createElement(`<label for="number--${id}.${key}" class="library--number_label">
      <p>${label}</p><input id="number--${id}.${key}" type="number"></inpu></label>`);
      return element;
    },
    async file(id, { key, label, extensions }) {
      const accept =
        extensions && extensions.length ? ` accept="${extensions.join(',')}"` : '';
      const element = web.createElement(`<label for="file--${id}.${key}" class="library--file_label">
      <input type="file" id="file--${id}.${key}"${accept}/><p>${label}</p>
      <p class="library--file"><span>${await fs.getText(
        'icons/fontawesome/file.svg'
      )}</span><span class="library--file_path">choose file...</span></p></label>`);
      element.querySelector('input[type="file"]').addEventListener('change', (ev) => {
        element.querySelector('.library--file_path').innerText = ev.target.files[0].name;
      });
      return element;
    },
    async documentation_buttons({ _dir }) {
      const element = web.createElement(`<p class="documentation--buttons">
      <a href="?">
      <span>
      ${await fs.getText(
        'icons/fontawesome/long-arrow-alt-left.svg'
      )}</span> <span>back to library</span></a>
      <a href="https://github.com/notion-enhancer/extension/tree/main/repo/${encodeURIComponent(
        _dir
      )}">
      <span>
      ${await fs.getText(
        'icons/fontawesome/code.svg'
      )}</span> <span>view source code</span></a>
      </p>`);
      return element;
    },
  },
  generators = {
    async summary_card(mod) {
      const article = web.createElement('<article class="library--summary_card"></article>'),
        body = web.createElement('<div></div>');
      article.append(await components.preview(mod));
      body.append(await components.name(mod));
      body.append(await components.tags(mod));
      body.append(await components.description(mod));
      body.append(await components.authors(mod));
      body.append(await components.expand(mod));
      article.append(body);
      return article;
    },
    async full_card(mod) {
      const article = web.createElement('<article class="library--full_card"></article>'),
        body = web.createElement('<div></div>');
      article.append(await components.preview(mod));
      body.append(await components.name(mod));
      body.append(await components.tags(mod));
      body.append(await components.description(mod));
      body.append(await components.authors(mod));
      article.append(body);
      if (mod.options && mod.options.length) {
        const options = web.createElement(`<div class="library--options"></div>`);
        (
          await Promise.all(mod.options.map((opt) => components[opt.type](mod.id, opt)))
        ).map((opt) => options.append(opt));
        article.append(options);
      }
      return article;
    },
    async documentation(mod) {
      const content = (await fs.isFile(`repo/${mod._dir}/README.md`))
          ? markdown.render(await fs.getText(`repo/${mod._dir}/README.md`))
          : '',
        article = web.createElement(
          `<article class="documentation--body">${content}</article>`
        );
      return article;
    },
  },
  tabs = {
    library: {
      title: document.querySelector('header [data-target="library"]'),
      async container() {
        document.querySelector('[data-target][data-active]').removeAttribute('data-active');
        this.title.dataset.active = true;
        const $container = document.querySelector('[data-container]');
        $container.dataset.container = 'library';
        $container.innerHTML = '';
        for (let mod of await registry.get())
          $container.append(await generators.summary_card(mod));
      },
    },
    mod: {
      title: document.querySelector('header [data-target="library"]'),
      async container(mod) {
        document.querySelector('[data-target][data-active]').removeAttribute('data-active');
        this.title.dataset.active = true;
        const $container = document.querySelector('[data-container]');
        $container.dataset.container = 'page';
        $container.innerHTML = '';
        $container.append(await components.documentation_buttons(mod));
        $container.append(await generators.full_card(mod));
        $container.append(await generators.documentation(mod));
      },
    },
  };
tabs.library.title.addEventListener('click', (ev) => tabs.library.container());

(async () => {
  const search = new Map(
      location.search
        .slice(1)
        .split('&')
        .map((query) => query.split('='))
    ),
    mod = (await registry.get()).find((mod) => mod.id === search.get('mod'));
  if (mod) {
    tabs.mod.container(mod);
  } else tabs.library.container();
})();

// registry.errors().then((err) => {
//   document.querySelector('[data-section="alerts"]').innerHTML = JSON.stringify(err);
// });
