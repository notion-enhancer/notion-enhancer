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

window.addEventListener('beforeunload', (event) => {
  // trigger input save
  document.activeElement.blur();
});

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
  _onChange: false,
  onChange() {
    if (this._onChange) return;
    this._onChange = true;
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
  >`,
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
    const author = (author) => web.html`<a
      class="mod-author"
      href="${web.escape(author.homepage)}"
      target="_blank"
    >
      <img class="mod-author-avatar"
        src="${web.escape(author.avatar)}" alt="${web.escape(author.name)}'s avatar"
      > <span>${web.escape(author.name)}</span>
    </a>`;
    return web.render(web.html`<p class="mod-authors-container"></p>`, ...authors.map(author));
  },
  toggle: (label, checked) => {
    const $label = web.html`<label tabindex="0" class="toggle-label">
      <span>${web.escape(label)}</span>
    </label>`,
      $input = web.html`<input tabindex="-1" type="checkbox" class="toggle-check"
        ${checked ? 'checked' : ''}>`,
      $feature = web.html`<span class="toggle-box toggle-feature"></span>`;
    $label.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) $input.checked = !$input.checked;
    });
    return web.render($label, $input, $feature);
  },
};

const $main = web.html`<main class="main"></main>`,
  $sidebar = web.html`<article class="sidebar"></article>`,
  $options = web.html`<div class="options-container">
    <p class="options-empty">Select a mod to view and configure its options.</p>
  </div>`;

const options = {
  toggle: async (mod, opt) => {
    const checked = await registry.profile.get([mod.id, opt.key], opt.value),
      $toggle = components.toggle(opt.label, checked),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = $toggle.children[0],
      $input = $toggle.children[1];
    if (opt.tooltip) {
      $label.prepend($tooltip);
      web.tooltip($tooltip, opt.tooltip);
    }
    $input.addEventListener('change', async (event) => {
      await registry.profile.set([mod.id, opt.key], $input.checked);
      notifications.onChange();
    });
    return $toggle;
  },
  select: async (mod, opt) => {
    const value = await registry.profile.get([mod.id, opt.key], opt.values[0]),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $select = web.html`<select class="input">
        ${opt.values
          .map(
            (option) =>
              web.raw`<option
                class="select-option"
                value="${web.escape(option)}"
                ${option === value ? 'selected' : ''}
              >${web.escape(option)}</option>`
          )
          .join('')}
      </select>`,
      $icon = web.html`${web.icon('chevron-down', { class: 'input-icon' })}`;
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $select.addEventListener('change', async (event) => {
      await registry.profile.set([mod.id, opt.key], $select.value);
      notifications.onChange();
    });
    return web.render($label, $select, $icon);
  },
  text: async (mod, opt) => {
    const value = await registry.profile.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input" value="${web.escape(value)}">`,
      $icon = web.html`${web.icon('type', { class: 'input-icon' })}`;
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await registry.profile.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },
  number: async (mod, opt) => {
    const value = await registry.profile.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="number" class="input" value="${value}">`,
      $icon = web.html`${web.icon('hash', { class: 'input-icon' })}`;
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await registry.profile.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },
  color: async (mod, opt) => {
    const value = await registry.profile.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input">`,
      $icon = web.html`${web.icon('droplet', { class: 'input-icon' })}`,
      paint = () => {
        $input.style.background = $picker.toBackground();
        $input.style.color = $picker.isLight() ? '#000' : '#fff';
        $input.style.padding = '';
      },
      $picker = new web.jscolor($input, {
        value,
        format: 'rgba',
        previewSize: 0,
        borderRadius: 3,
        borderColor: 'var(--theme--ui_divider)',
        controlBorderColor: 'var(--theme--ui_divider)',
        backgroundColor: 'var(--theme--bg)',
        onInput: paint,
        onChange: paint,
      });
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', async (event) => {
      await registry.profile.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    paint();
    return web.render($label, $input, $icon);
  },
  file: async (mod, opt) => {
    const { filename } = (await registry.profile.get([mod.id, opt.key], {})) || {},
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $pseudo = web.html`<span class="input"><span class="input-placeholder">Upload file...</span></span>`,
      $input = web.html`<input type="file" class="hidden" accept=${web.escape(
        opt.extensions.join(',')
      )}>`,
      $icon = web.html`${web.icon('file', { class: 'input-icon' })}`,
      $filename = web.html`<span>${web.escape(filename || 'none')}</span>`,
      $latest = web.render(web.html`<button class="file-latest">Latest: </button>`, $filename);
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $input.addEventListener('change', (event) => {
      const file = event.target.files[0],
        reader = new FileReader();
      reader.onload = async (progress) => {
        $filename.innerText = file.name;
        await registry.profile.set([mod.id, opt.key], {
          filename: file.name,
          content: progress.currentTarget.result,
        });
        notifications.onChange();
      };
      reader.readAsText(file);
    });
    $latest.addEventListener('click', (event) => {
      $filename.innerText = 'none';
      registry.profile.set([mod.id, opt.key], {});
    });
    return web.render(
      web.html`<div></div>`,
      web.render($label, $input, $pseudo, $icon),
      $latest
    );
  },
  hotkey: async (mod, opt) => {
    const value = await registry.profile.get([mod.id, opt.key], opt.value),
      $tooltip = web.html`${web.icon('info', { class: 'input-tooltip' })}`,
      $label = web.render(
        web.html`<label class="input-label"></label>`,
        web.render(web.html`<p></p>`, opt.tooltip ? $tooltip : '', opt.label)
      ),
      $input = web.html`<input type="text" class="input" value="${web.escape(value)}">`,
      $icon = web.html`${web.icon('command', { class: 'input-icon' })}`;
    if (opt.tooltip) web.tooltip($tooltip, opt.tooltip);
    $input.addEventListener('keydown', async (event) => {
      event.preventDefault();
      const pressed = [],
        modifiers = {
          metaKey: 'Meta',
          ctrlKey: 'Control',
          altKey: 'Alt',
          shiftKey: 'Shift',
        };
      for (const modifier in modifiers) {
        if (event[modifier]) pressed.push(modifiers[modifier]);
      }
      const empty = ['Backspace', 'Delete'].includes(event.key) && !pressed.length;
      if (!empty && !pressed.includes(event.key)) {
        let key = event.key;
        if (key === ' ') key = 'Space';
        if (key.length === 1) key = event.key.toUpperCase();
        pressed.push(key);
      }
      $input.value = pressed.join('+');
      await registry.profile.set([mod.id, opt.key], $input.value);
      notifications.onChange();
    });
    return web.render($label, $input, $icon);
  },
};

components.options = async (mod) => {
  const $fragment = document.createDocumentFragment();
  for (const opt of mod.options) {
    web.render($fragment, await options[opt.type](mod, opt));
  }
  if (!mod.options.length) {
    web.render($fragment, web.html`<p class="options-empty">No options.</p>`);
  }
  return $fragment;
};

components.mod = async (mod) => {
  const $mod = web.html`<div class="mod"></div>`,
    $toggle = components.toggle('', await registry.enabled(mod.id));
  $toggle.addEventListener('change', (event) => {
    registry.profile.set(['_mods', mod.id], event.target.checked);
    notifications.onChange();
  });
  $mod.addEventListener('click', async (event) => {
    if ($mod.className === 'mod-selected') return;
    for (const $selected of document.querySelectorAll('.mod-selected')) {
      $selected.className = 'mod';
    }
    $mod.className = 'mod-selected';
    web.render(
      web.empty($options),
      web.render(components.title(mod.name), components.version(mod.version)),
      components.tags(mod.tags),
      await components.options(mod)
    );
  });
  return web.render(
    web.html`<article class="mod-container"></article>`,
    web.render(
      $mod,
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

components._$modListCache = {};
components.modList = async (category) => {
  if (!components._$modListCache[category]) {
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
    components._$modListCache[category] = web.render(
      web.html`<div></div>`,
      web.render(
        web.html`<label class="search-container"></label>`,
        $search,
        web.html`${web.icon('search', { class: 'input-icon' })}`
      ),
      $list
    );
  }
  return components._$modListCache[category];
};

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
  $communityNavItem = web.html`<a href="https://discord.gg/sFWPXtA" class="nav-item">community</a>`;

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
        $communityNavItem
      ),
      $main
    ),
    web.render($sidebar, $options)
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
