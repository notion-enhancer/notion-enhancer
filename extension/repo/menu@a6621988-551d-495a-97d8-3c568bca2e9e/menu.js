/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = 'a6621988-551d-495a-97d8-3c568bca2e9e';
import { env, storage, web, fmt, fs, registry } from '../../helpers.js';

for (let mod of await registry.get()) {
  if (!(await registry.enabled(mod.id))) continue;
  for (let sheet of mod.css?.menu || []) {
    web.loadStyleset(`repo/${mod._dir}/${sheet}`);
  }
}

document
  .querySelector('img[data-view-target="notion"]')
  .addEventListener('click', env.focusNotion);
web.hotkeyListener(await storage.get(_id, 'hotkey.focustoggle'), env.focusNotion);

const hovertip = {
  $el: document.querySelector('.tooltip'),
  add($parent, selector, text) {
    text = fmt.md.render(text);
    $parent.addEventListener('mouseover', (event) => {
      if (event.target.matches(selector) || event.target.matches(`${selector} *`)) {
        this.$el.innerHTML = text;
        this.$el.style.display = 'block';
      }
    });
    $parent.addEventListener('mousemove', (event) => {
      this.$el.style.top = event.clientY - this.$el.clientHeight + 'px';
      this.$el.style.left =
        event.clientX < window.innerWidth / 2 ? event.clientX + 20 + 'px' : '';
    });
    $parent.addEventListener('mouseout', (event) => {
      if (event.target.matches(selector) || event.target.matches(`${selector} *`)) {
        this.$el.style.display = '';
      }
    });
  },
};

const components = {};
components.card = {
  preview: ({ preview = '' }) =>
    preview
      ? web.createElement(web.html`<img
      alt=""
      class="library--preview"
      src="${web.escapeHtml(preview)}"
      />`)
      : '',
  async name({ name, id, version, tags }) {
    if (registry.CORE.includes(id))
      return web.createElement(web.html`<div class="library--title"><h2>
      <span>
        ${web.escapeHtml(name)}
        <span class="library--version">v${web.escapeHtml(version)}</span>
      </span>
    </h2></div>`);
    const $el = web.createElement(web.html`<label
      for="enable--${web.escapeHtml(id)}"
      class="library--title library--toggle_label"
      >
      <input type="checkbox" id="enable--${web.escapeHtml(id)}"
      ${(await storage.get('_enabled', id, false)) ? 'checked' : ''}/>
      <h2>
        <span>
          ${web.escapeHtml(name)}
          <span class="library--version">v${web.escapeHtml(version)}</span>
        </span>
        <span class="library--toggle"></span>
      </h2>
    </label>`);
    $el.addEventListener('change', async (event) => {
      storage.set('_enabled', id, event.target.checked);
      if (
        event.target.checked &&
        tags.includes('theme') &&
        (await storage.get(_id, 'themes.autoresolve', true))
      ) {
        const themes = (await registry.get()).filter(
          (mod) =>
            mod.tags.includes('theme') &&
            mod.id !== id &&
            ((mod.tags.includes('dark') && tags.includes('dark')) ||
              (mod.tags.includes('light') && tags.includes('light')))
        );
        for (const theme of themes) {
          if (document.body.dataset.view === 'library') {
            const $toggle = document.getElementById(`enable--${theme.id}`);
            if ($toggle.checked) $toggle.click();
          } else storage.set('_enabled', theme.id, false);
        }
      }
    });
    return $el;
  },
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
          <span><i data-icon="fa/long-arrow-alt-right"></i></span>
          <span>settings & documentation</span>
        </a>
      </p>`
    ),
  async _generate(mod) {
    const card = web.createElement(web.html`<article class="library--card"></article>`),
      body = web.createElement(web.html`<div></div>`);
    card.append(this.preview(mod));
    body.append(await this.name(mod));
    body.append(this.tags(mod));
    body.append(this.description(mod));
    body.append(this.authors(mod));
    body.append(await this.expand(mod));
    card.append(body);
    return card;
  },
};
components.options = {
  async toggle(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`<label
      for="toggle--${web.escapeHtml(`${id}.${key}`)}"
      class="library--toggle_label"
      >
      <input type="checkbox" id="toggle--${web.escapeHtml(`${id}.${key}`)}"
      ${state ? 'checked' : ''}/>
      <p>
        <span data-tooltip>${web.escapeHtml(label)}
        <i data-icon="fa/question-circle"></i></span>
        <span class="library--toggle"></span>
      </p>
      </label>`);
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.checked));
    hovertip.add(opt, '[data-tooltip]', tooltip);
    return opt;
  },
  async select(id, { key, label, tooltip, values }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`<label
        for="select--${web.escapeHtml(`${id}.${key}`)}"
        class="library--select_label"
      >
      <p><span data-tooltip>${web.escapeHtml(label)}
      <i data-icon="fa/question-circle"></i></span></p>
      <p class="library--select">
        <span><i data-icon="fa/caret-down"></i></span>
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
    hovertip.add(opt, '[data-tooltip]', tooltip);
    return opt;
  },
  async text(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`<label
      for="text--${web.escapeHtml(`${id}.${key}`)}"
      class="library--text_label"
      >
      <p><span data-tooltip>${web.escapeHtml(label)}
      <i data-icon="fa/question-circle"></i></span></p>
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
    hovertip.add(opt, '[data-tooltip]', tooltip);
    return opt;
  },
  async number(id, { key, label, tooltip }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`<label
      for="number--${web.escapeHtml(`${id}.${key}`)}"
      class="library--number_label"
      >
      <p><span data-tooltip>${web.escapeHtml(label)}
      <i data-icon="fa/question-circle"></i></span></p>
      <input id="number--${web.escapeHtml(`${id}.${key}`)}"
      type="number" value="${web.escapeHtml(state.toString())}"/>
    </label>`);
    opt.addEventListener('change', (event) => storage.set(id, key, event.target.value));
    hovertip.add(opt, '[data-tooltip]', tooltip);
    return opt;
  },
  async file(id, { key, label, tooltip, extensions }) {
    const state = await storage.get(id, key),
      opt = web.createElement(web.html`<label
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
      <p><span data-tooltip>${web.escapeHtml(label)}
      <i data-icon="fa/question-circle"></i></span></p>
      <p class="library--file">
        <span><i data-icon="fa/file"></i></span>
        <span class="library--file_path">${web.escapeHtml(state || 'choose file...')}</span>
      </p>
    </label>`);
    opt.addEventListener('change', (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      opt.querySelector('.library--file_path').innerText = file.name;
      storage.set(id, key, file.name);
      reader.onload = (progress) => {
        storage.set(id, `_file.${key}`, progress.currentTarget.result);
      };
      reader.readAsText(file);
    });
    opt.addEventListener('click', (event) => {
      document.documentElement.scrollTop = 0;
    });
    hovertip.add(
      opt,
      '[data-tooltip]',
      `${tooltip}\n\n**warning:** browser extensions do not have true filesystem access,
      so the content of the file is saved on selection. after editing it,
      the file will need to be re-selected.`
    );
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
  _reloadTriggered: false,
  buttons({ _dir }) {
    const $el = web.createElement(web.html`<p class="documentation--buttons">
      <a href="?view=library">
        <span><i data-icon="fa/long-arrow-alt-left"></i></span>
        <span>back to library</span>
      </a>
      <a
        href="https://github.com/notion-enhancer/extension/tree/main/repo/${encodeURIComponent(
          _dir
        )}"
      >
        <span><i data-icon="fa/code"></i></span>
        <span>view source code</span>
      </a>
      <button class="documentation--reload"${this._reloadTriggered ? ' data-triggered' : ''}>
        <span><i data-icon="fa/redo"></i></span>
        <span>reload tabs to apply changes</span>
      </button>
    </p>`);
    storage.onChange(() => {
      const $reload = $el.querySelector('.documentation--reload');
      if (document.body.contains($el) && !$reload.dataset.triggered) {
        $reload.dataset.triggered = true;
        this._reloadTriggered = true;
      }
    });
    $el.querySelector('.documentation--reload').addEventListener('click', env.reloadTabs);
    return $el;
  },
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
  $container: document.querySelector('main'),
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
        document.body.dataset.view = '';
        document
          .querySelector('[data-view-target][data-view-active]')
          ?.removeAttribute('data-view-active');
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
      .forEach((img) => (img.onerror = (event) => event.target.remove()));
    document
      .querySelectorAll('a[href^="?"]')
      .forEach((a) => a.addEventListener('click', this._router));
    document
      .querySelectorAll('a[href^="#"]')
      .forEach((a) => a.addEventListener('click', this._navigator));
    document.querySelectorAll('[data-icon]').forEach((icon) =>
      fs.getText(`icons/${icon.dataset.icon}.svg`).then((svg) => {
        svg = web.createElement(svg);
        for (const attr of icon.attributes) {
          svg.setAttribute(attr.name, attr.value);
        }
        icon.replaceWith(svg);
      })
    );
  },
  async mod(mod) {
    document.body.dataset.view = 'mod';
    document.querySelector('header [data-view-target="library"]').dataset.active = true;
    this.$container.append(components.documentation.buttons(mod));
    this.$container.append(await components.options._generate(mod));
    this.$container.append(await components.documentation.readme(mod));
  },
  async library() {
    document.body.dataset.view = 'library';
    document.querySelector('header [data-view-target="library"]').dataset.active = true;
    for (let mod of await registry.get())
      this.$container.append(await components.card._generate(mod));
  },
};
views._router = views._router.bind(views);
views._navigator = views._navigator.bind(views);
views._load();
window.addEventListener('popstate', (event) => {
  if (event.state) views._load();
});

const notifications = {
  $list: document.querySelector('.notification--list'),
  push({ heading, message = '', type = 'information' }, onDismiss = () => {}) {
    let svg = '',
      className = 'notification';
    switch (type) {
      case 'celebration':
        svg = web.html`<i data-icon="monster/party"></i>`;
        className += ' celebration';
        break;
      case 'information':
        svg = web.html`<i data-icon="fa/info"></i>`;
        className += ' information';
        break;
      case 'warning':
        svg = web.html`<i data-icon="fa/exclamation-triangle"></i>`;
        className += ' warning';
        break;
    }
    const $notif = web.createElement(web.html`<div role="alert" class="${className}">
      <div>${svg}</div>
      <div>
        <h3>${web.escapeHtml(heading)}</h3>
        <p>${fmt.md.renderInline(message)}</p>
      </div>
      <button class="notification--dismiss">&times;</button>
    </div>`);
    $notif.querySelector('.notification--dismiss').addEventListener('click', (event) => {
      $notif.style.opacity = 0;
      $notif.style.transform = 'scaleY(0)';
      $notif.style.marginTop = `-${
        $notif.offsetHeight / parseFloat(getComputedStyle(document.documentElement).fontSize)
      }rem`;
      setTimeout(() => $notif.remove(), 400);
      onDismiss();
    });
    setTimeout(() => {
      $notif.style.opacity = 1;
    }, 100);
    return this.$list.append($notif);
  },
  async fetch() {
    const notifications = {
      list: await fs.getJSON('https://notion-enhancer.github.io/notifications.json'),
      dismissed: await storage.get(_id, 'notifications', []),
    };
    notifications.list = notifications.list.sort((a, b) => b.id - a.id);
    notifications.waiting = notifications.list.filter(
      ({ id }) => !notifications.dismissed.includes(id)
    );
    for (let notification of notifications.waiting) {
      if (
        notification.heading &&
        notification.appears_on &&
        (notification.appears_on.versions.includes('*') ||
          notification.appears_on.versions.includes(env.version)) &&
        notification.appears_on.extension
      ) {
        this.push(notification, async () => {
          const dismissed = await storage.get(_id, 'notifications', []);
          storage.set('_notifications', 'external', [
            ...new Set([...dismissed, notification.id]),
          ]);
        });
      }
    }
  },
};
for (const error of await registry.errors()) {
  notifications.push({
    heading: `error: ${error.source}`,
    message: error.message,
    type: 'warning',
  });
}
notifications.fetch();

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
