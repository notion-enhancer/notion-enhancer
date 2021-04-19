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

const components = {
    preview({ preview }) {
      if (!preview) return '';
      const element = web.createElement(
        `<img alt="" class="library--preview" src="${preview}" />`
      );
      return element;
    },
    name({ name, id, version }) {
      const element = web.createElement(`<label for="enable--${id}" class="library--title library--toggle_label">
      <input type="checkbox" id="enable--${id}" />
      <h2><span>${name} <span class="library--version">v${version}</span></span>
      <span class="library--toggle"></span></h2></label>`);
      return element;
    },
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
    authors({ authors }) {
      const element = web.createElement(
        `<ul class="library--authors">${authors
          .map(
            (author) =>
              `<li><a href="${author.url}"><img src="${author.icon}"/> <span>${author.name}</span></a></li>`
          )
          .join('')}</ul>`
      );
      return element;
    },
    expand({ id }) {
      const element = web.createElement(`<p class="library--expand"><a href="?mod=${id}">
      <!-- https://fontawesome.com/icons/long-arrow-alt-right?style=solid -->
      <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor"
      d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z">
      </path></svg></span> <span>settings & documentation</span></a></p>`);
      return element;
    },
    toggle(id, { key, label, value }) {
      const element = web.createElement(`<label for="toggle--${id}.${key}" class="library--toggle_label">
      <input type="checkbox" id="toggle--${id}.${key}" />
      <p><span>${label}</span><span class="library--toggle"></span></p></label>`);
      return element;
    },
    select(id, { key, label, values }) {
      const element = web.createElement(`<label for="select--${id}.${key}" class="library--select_label">
      <p>${label}</p><p class="library--select"><span>
      <!-- https://fontawesome.com/icons/caret-down?style=solid -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path fill="currentColor" d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"></path></svg></span>
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
    file(id, { key, label, extensions }) {
      const accept =
        extensions && extensions.length ? ` accept="${extensions.join(',')}"` : '';
      const element = web.createElement(`<label for="file--${id}.${key}" class="library--file_label">
      <input type="file" id="file--${id}.${key}"${accept}/><p>${label}</p>
      <p class="library--file"><span><!-- https://fontawesome.com/icons/file?style=solid -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor"
      d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"
      /></svg></span><span class="library--file_path">choose file...</span></p></label>`);
      element.querySelector('input[type="file"]').addEventListener('change', (ev) => {
        element.querySelector('.library--file_path').innerText = ev.target.files[0].name;
      });
      return element;
    },
    documentation_buttons({ _dir }) {
      const element = web.createElement(`<p class="documentation--buttons">
      <a href="?"><!-- https://fontawesome.com/icons/long-arrow-alt-left?style=solid -->
      <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor"
      d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z">
      </path></svg></span> <span>back to library</span></a>
      <a href="https://github.com/notion-enhancer/extension/tree/main/repo/${encodeURIComponent(
        _dir
      )}"><!-- https://fontawesome.com/icons/code?style=solid -->
      <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor"
      d="M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z">
      </path></svg></span> <span>view source code</span></a>
      </p>`);
      return element;
    },
  },
  generators = {
    summary_card(mod) {
      const article = web.createElement('<article class="library--summary_card"></article>'),
        body = web.createElement('<div></div>');
      article.append(components.preview(mod));
      body.append(components.name(mod));
      body.append(components.tags(mod));
      body.append(components.description(mod));
      body.append(components.authors(mod));
      body.append(components.expand(mod));
      article.append(body);
      return article;
    },
    full_card(mod) {
      const article = web.createElement('<article class="library--full_card"></article>'),
        body = web.createElement('<div></div>');
      article.append(components.preview(mod));
      body.append(components.name(mod));
      body.append(components.tags(mod));
      body.append(components.description(mod));
      body.append(components.authors(mod));
      article.append(body);
      if (mod.options && mod.options.length) {
        const options = web.createElement(`<div class="library--options"></div>`);
        mod.options.forEach((opt) => options.append(components[opt.type](mod.id, opt)));
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
        for (let mod of await registry.get()) $container.append(generators.summary_card(mod));
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
        $container.append(components.documentation_buttons(mod));
        $container.append(generators.full_card(mod));
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
