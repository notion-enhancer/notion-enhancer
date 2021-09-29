/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// initialisation and external interactions

import * as api from '../../api/_.mjs';
const { env, fmt, fs, registry, web } = api,
  db = await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e');

import { tw } from './styles.mjs';

web.addHotkeyListener(await db.get(['hotkey']), env.focusNotion);

for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
  for (const sheet of mod.css?.menu || []) {
    web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
  }
}

const loadTheme = async () => {
  document.documentElement.className =
    (await db.get(['theme'], 'light')) === 'dark' ? 'dark' : '';
};
document.addEventListener('visibilitychange', loadTheme);
loadTheme();

const notifications = {
  $container: web.html`<div class="notifications-container"></div>`,
  cache: await db.get(['notifications'], []),
  provider: [
    env.welcomeNotification,
    ...(await fs.getJSON('https://notion-enhancer.github.io/notifications.json')),
  ],
  add({ icon, message, id = undefined, color = undefined, link = undefined }) {
    const $notification = link
        ? web.html`<a
          href="${web.escape(link)}"
          class="${tw`notification-${color || 'default'}`}"
          role="alert"
          target="_blank"
        ></a>`
        : web.html`<p
          class="${tw`notification-${color || 'default'}`}"
          role="alert"
          tabindex="0"
        ></p>`,
      resolve = async () => {
        if (id !== undefined) {
          notifications.cache.push(id);
          await db.set(['notifications'], notifications.cache);
        }
        $notification.remove();
      };
    $notification.addEventListener('click', resolve);
    $notification.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) resolve();
    });
    web.render(
      notifications.$container,
      web.render(
        $notification,
        web.html`<span class="notification-text markdown-inline">
          ${fmt.md.renderInline(message)}
        </span>`,
        web.html`${web.icon(icon, { class: 'notification-icon' })}`
      )
    );
    return $notification;
  },
  _changes: false,
  changes() {
    if (this._changes) return;
    this._changes = true;
    const $notification = this.add({
      icon: 'refresh-cw',
      message: 'Reload to apply changes.',
    });
    $notification.addEventListener('click', env.reload);
  },
};
web.render(document.body, notifications.$container);
for (const notification of notifications.provider) {
  if (
    !notifications.cache.includes(notification.id) &&
    notification.version === env.version &&
    (!notification.environments || notification.environments.includes(env.name))
  ) {
    notifications.add(notification);
  }
}

const errors = await registry.errors();
if (errors.length) {
  console.log('[notion-enhancer] registry errors:');
  console.table(errors);
  notifications.add({
    icon: 'alert-circle',
    message: 'Failed to load mods (check console).',
    color: 'red',
  });
}

// mod config

const components = {
  preview: (url) => web.html`<img
    class="mod-preview"
    src="${web.escape(url)}"
    alt=""
  />`,
  title: (title) => web.html`<h4 class="mod-title"><span>${web.escape(title)}</span></h4>`,
  version: (version) => web.html`<span class="mod-version">v${web.escape(version)}</span>`,
  tags: (tags) => {
    if (!tags.length) return '';
    return web.render(
      web.html`<p class="mod-tags"></p>`,
      tags.map((tag) => `#${web.escape(tag)}`).join(' ')
    );
  },
  description: (description) => web.html`<p class="mod-description markdown-inline">
    ${fmt.md.renderInline(description)}
  </p>`,
  authors: (authors) => {
    const author = (author) => web.html`<a class="mod-author" href="${web.escape(
      author.homepage
    )}">
      <img class="mod-author-avatar"
        src="${web.escape(author.avatar)}" alt="${web.escape(author.name)}'s avatar"
      /> <span>${web.escape(author.name)}</span>
    </a>`;
    return web.render(web.html`<p class="mod-authors-container"></p>`, ...authors.map(author));
  },
  toggle: (checked) => {
    const $label = web.html`<label tabindex="0" class="toggle-label-full"></label>`,
      $input = web.html`<input tabindex="-1" type="checkbox" class="toggle-check-right"
        ${checked ? 'checked' : ''}/>`;
    $label.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) $input.checked = !$input.checked;
    });
    return web.render(
      $label,
      $input,
      web.html`<span class="toggle-box toggle-feature"></span>`
    );
  },
};

components.mod = async (mod) => {
  const $toggle = components.toggle(await registry.enabled(mod.id));
  $toggle.addEventListener('change', (event) => {
    registry.profile.set(['_mods', mod.id], event.target.checked);
    notifications.changes();
  });
  return web.render(
    web.html`<article class="mod-container"></article>`,
    web.render(
      web.html`<div class="mod"></div>`,
      mod.preview
        ? components.preview(
            mod.preview.startsWith('http')
              ? mod.preview
              : fs.localPath(`repo/${mod._dir}/${mod.preview}`)
          )
        : '',
      web.render(
        web.html`<div class="mod-body"></div>`,
        web.render(components.title(mod.name), components.version(mod.version)),
        components.tags(mod.tags),
        components.description(mod.description),
        components.authors(mod.authors),
        mod.environments.includes(env.name) && !registry.core.includes(mod.id) ? $toggle : ''
      )
    )
  );
};

components.modList = async (category) => {
  const $search = web.html`<input type="search" class="search"
    placeholder="Search ('/' to focus)">`,
    $list = web.html`<div class="mods-list"></div>`,
    mods = await registry.list(
      (mod) => mod.environments.includes(env.name) && mod.tags.includes(category)
    );
  web.addHotkeyListener(['/'], () => $search.focus());
  $search.addEventListener('input', (event) => {
    const query = $search.value.toLowerCase();
    for (const $mod of $list.children) {
      const matches = !query || $mod.innerText.toLowerCase().includes(query);
      $mod.classList[matches ? 'remove' : 'add']('hidden');
    }
  });
  for (const mod of mods) {
    mod.tags = mod.tags.filter((tag) => tag !== category);
    web.render($list, await components.mod(mod));
    mod.tags.unshift(category);
  }
  return web.render(
    web.html`<div></div>`,
    web.render(web.html`<div class="search-container"></div>`, $search),
    $list
  );
};

const $main = web.html`<main class="main"></main>`,
  $sidebar = web.html`<article class="sidebar"></article>`;

const $notionNavItem = web.html`<h1 class="nav-notion">
    ${(await fs.getText('icon/colour.svg')).replace(
      /width="\d+" height="\d+"/,
      `class="nav-notion-icon"`
    )}
    <a href="https://notion-enhancer.github.io/" target="_blank">notion-enhancer</a>
  </h1>`;
$notionNavItem.children[0].addEventListener('click', env.focusNotion);

const $coreNavItem = web.html`<a href="?view=core" class="nav-item">core</a>`,
  $extensionsNavItem = web.html`<a href="?view=extensions" class="nav-item">extensions</a>`,
  $themesNavItem = web.html`<a href="?view=themes" class="nav-item">themes</a>`,
  $supportNavItem = web.html`<a href="https://discord.gg/sFWPXtA" class="nav-item">support</a>`;

web.render(
  document.body,
  web.render(
    web.html`<div class="body-container"></div>`,
    web.render(
      web.html`<div class="content-container"></div>`,
      web.render(
        web.html`<nav class="nav"></nav>`,
        $notionNavItem,
        $coreNavItem,
        $extensionsNavItem,
        $themesNavItem,
        $supportNavItem
      ),
      $main
    ),
    $sidebar
  )
);

function selectNavItem($item) {
  for (const $selected of document.querySelectorAll('.nav-item-selected')) {
    $selected.className = 'nav-item';
  }
  $item.className = 'nav-item-selected';
}

import * as router from './router.mjs';

router.addView('core', async () => {
  web.empty($main);
  selectNavItem($coreNavItem);
  return web.render($main, await components.modList('core'));
});

router.addView('extensions', async () => {
  web.empty($main);
  selectNavItem($extensionsNavItem);
  return web.render($main, await components.modList('extension'));
});

router.addView('themes', async () => {
  web.empty($main);
  selectNavItem($themesNavItem);
  return web.render($main, await components.modList('theme'));
});

router.loadView('extensions', $main);
