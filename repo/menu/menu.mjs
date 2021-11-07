/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import * as api from '../../api/_.mjs';
import { notifications, $changelogModal } from './notifications.mjs';
import { modComponents, options } from './components.mjs';
import * as router from './router.mjs';
import './styles.mjs';

(async () => {
  const { env, fs, storage, registry, web, components } = api;

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.menu || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
    for (let script of mod.js?.menu || []) {
      script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
      script.default(api, await registry.db(mod.id));
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

  const db = await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e'),
    profileName = await registry.profileName(),
    profileDB = await registry.profileDB();

  web.addHotkeyListener(await db.get(['hotkey']), env.focusNotion);

  const loadTheme = async () => {
    document.documentElement.className =
      (await storage.get(['theme'], 'light')) === 'dark' ? 'dark' : '';
  };
  document.addEventListener('visibilitychange', loadTheme);
  loadTheme();

  window.addEventListener('beforeunload', (event) => {
    // trigger input save
    document.activeElement.blur();
  });

  const $main = web.html`<main class="main"></main>`,
    $sidebar = web.html`<article class="sidebar"></article>`,
    $options = web.html`<div class="options-container">
    <p class="options-placeholder">Select a mod to view and configure its options.</p>
  </div>`,
    $profile = web.html`<button class="profile-trigger">
    Profile: ${web.escape(profileName)}
  </button>`;

  // profile

  let _$profileConfig;
  const openProfileMenu = async () => {
    if (!_$profileConfig) {
      const profileNames = [
          ...new Set([
            ...Object.keys(await storage.get(['profiles'], { default: {} })),
            profileName,
          ]),
        ],
        $options = profileNames.map(
          (profile) => web.raw`<option
          class="select-option"
          value="${web.escape(profile)}"
          ${profile === profileName ? 'selected' : ''}
        >${web.escape(profile)}</option>`
        ),
        $select = web.html`<select class="input">
        <option class="select-option" value="--">-- new --</option>
        ${$options.join('')}
      </select>`,
        $edit = web.html`<input
        type="text"
        class="input"
        value="${web.escape(profileName)}"
        pattern="/^[A-Za-z0-9_-]+$/"
      >`,
        $export = web.html`<button class="profile-export">
        ${await components.feather('download', { class: 'profile-icon-action' })}
      </button>`,
        $import = web.html`<label class="profile-import">
        <input type="file" class="hidden" accept="application/json">
        ${await components.feather('upload', { class: 'profile-icon-action' })}
      </label>`,
        $save = web.html`<button class="profile-save">
        ${await components.feather('save', { class: 'profile-icon-text' })} Save
      </button>`,
        $delete = web.html`<button class="profile-delete">
        ${await components.feather('trash-2', { class: 'profile-icon-text' })} Delete
      </button>`,
        $error = web.html`<p class="profile-error"></p>`;

      $export.addEventListener('click', async (event) => {
        const now = new Date(),
          $a = web.html`<a
          class="hidden"
          download="notion-enhancer_${web.escape($select.value)}_${now.getFullYear()}-${
            now.getMonth() + 1
          }-${now.getDate()}.json"
          href="data:text/plain;charset=utf-8,${encodeURIComponent(
            JSON.stringify(await storage.get(['profiles', $select.value], {}), null, 2)
          )}"
        ></a>`;
        web.render(document.body, $a);
        $a.click();
        $a.remove();
      });

      $import.addEventListener('change', (event) => {
        const file = event.target.files[0],
          reader = new FileReader();
        reader.onload = async (progress) => {
          try {
            const profileUpload = JSON.parse(progress.currentTarget.result);
            if (!profileUpload) throw Error;
            await storage.set(['profiles', $select.value], profileUpload);
            env.reload();
          } catch {
            web.render(web.empty($error), 'Invalid JSON uploaded.');
          }
        };
        reader.readAsText(file);
      });

      $select.addEventListener('change', async (event) => {
        if ($select.value === '--') {
          $edit.value = '';
        } else $edit.value = $select.value;
      });

      $save.addEventListener('click', async (event) => {
        if (profileNames.includes($edit.value) && $select.value !== $edit.value) {
          web.render(
            web.empty($error),
            `The profile "${web.escape($edit.value)}" already exists.`
          );
          return false;
        }
        if (!$edit.value) {
          web.render(web.empty($error), 'Profile names cannot be empty.');
          return false;
        }
        if (!$edit.value.match(/^[A-Za-z0-9_-]+$/)) {
          web.render(
            web.empty($error),
            'Profile names can only contain letters, numbers, dashes and underscores.'
          );
          return false;
        }
        await storage.set(['currentprofile'], $edit.value);
        if ($select.value === '--') {
          await storage.set(['profiles', $edit.value], {});
        } else if ($select.value !== $edit.value) {
          await storage.set(
            ['profiles', $edit.value],
            await storage.get(['profiles', $select.value], {})
          );
          await storage.set(['profiles', $select.value], undefined);
        }
        env.reload();
      });

      $delete.addEventListener('click', async (event) => {
        await storage.set(['profiles', $select.value], undefined);
        await storage.set(
          ['currentprofile'],
          profileNames.find((profile) => profile !== $select.value) || 'default'
        );
        env.reload();
      });

      _$profileConfig = web.render(
        web.html`<div></div>`,
        web.html`<p class="options-placeholder">
        Profiles are used to switch entire configurations.
        Here they can be selected, renamed or deleted.
        Profile names can only contain letters, numbers,
        dashes and underscores. <br>
        Be careful - deleting a profile deletes all configuration
        related to it. 
      </p>`,
        web.render(
          web.html`<label class="input-label"></label>`,
          $select,
          web.html`${await components.feather('chevron-down', { class: 'input-icon' })}`
        ),
        web.render(
          web.html`<label class="input-label"></label>`,
          $edit,
          web.html`${await components.feather('type', { class: 'input-icon' })}`
        ),
        web.render(
          web.html`<p class="profile-actions"></p>`,
          $export,
          $import,
          $save,
          $delete
        ),
        $error
      );
    }
    web.render(web.empty($options), _$profileConfig);
  };
  $profile.addEventListener('click', () => openSidebarMenu('profile'));

  // mods

  const $modLists = {},
    generators = {
      options: async (mod) => {
        const $fragment = document.createDocumentFragment();
        for (const opt of mod.options) {
          if (!opt.environments.includes(env.name)) continue;
          web.render($fragment, await options[opt.type](mod, opt));
        }
        if (!mod.options.length) {
          web.render($fragment, web.html`<p class="options-placeholder">No options.</p>`);
        }
        return $fragment;
      },
      mod: async (mod) => {
        const $mod = web.html`<div class="mod" data-id="${web.escape(mod.id)}"></div>`,
          $toggle = modComponents.toggle('', await registry.enabled(mod.id));
        $toggle.addEventListener('change', async (event) => {
          if (event.target.checked && mod.tags.includes('theme')) {
            const mode = mod.tags.includes('light') ? 'light' : 'dark',
              id = mod.id,
              mods = await registry.list(
                (mod) =>
                  mod.environments.includes(env.name) &&
                  mod.tags.includes('theme') &&
                  mod.tags.includes(mode) &&
                  mod.id !== id
              );
            for (const mod of mods) {
              profileDB.set(['_mods', mod.id], false);
              document.querySelector(
                `[data-id="${web.escape(mod.id)}"] .toggle-check`
              ).checked = false;
            }
          }
          profileDB.set(['_mods', mod.id], event.target.checked);
          notifications.onChange();
        });
        $mod.addEventListener('click', () => openSidebarMenu(mod.id));
        return web.render(
          web.html`<article class="mod-container"></article>`,
          web.render(
            $mod,
            mod.preview
              ? modComponents.preview(
                  mod.preview.startsWith('http')
                    ? mod.preview
                    : fs.localPath(`repo/${mod._dir}/${mod.preview}`)
                )
              : '',
            web.render(
              web.html`<div class="mod-body"></div>`,
              web.render(modComponents.title(mod.name), modComponents.version(mod.version)),
              modComponents.tags(mod.tags),
              modComponents.description(mod.description),
              modComponents.authors(mod.authors),
              mod.environments.includes(env.name) && !registry.core.includes(mod.id)
                ? $toggle
                : ''
            )
          )
        );
      },
      modList: async (category, message = '') => {
        if (!$modLists[category]) {
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
            web.render($list, await generators.mod(mod));
            mod.tags.unshift(category);
          }
          $modLists[category] = web.render(
            web.html`<div></div>`,
            web.render(
              web.html`<label class="search-container"></label>`,
              $search,
              web.html`${await components.feather('search', { class: 'input-icon' })}`
            ),
            message ? web.render(web.html`<p class="main-message"></p>`, message) : '',
            $list
          );
        }
        return $modLists[category];
      },
    };

  async function openModMenu(id) {
    let $mod;
    for (const $list of Object.values($modLists)) {
      $mod = $list.querySelector(`[data-id="${web.escape(id)}"]`);
      if ($mod) break;
    }
    const mod = await registry.get(id);
    if (!$mod || !mod || $mod.className === 'mod-selected') return;

    $mod.className = 'mod-selected';
    const fragment = [
      web.render(modComponents.title(mod.name), modComponents.version(mod.version)),
      modComponents.tags(mod.tags),
      await generators.options(mod),
    ];
    web.render(web.empty($options), ...fragment);
  }

  // views

  const $notionNavItem = web.html`<h1 class="nav-notion">
    ${(await fs.getText('media/colour.svg')).replace(
      /width="\d+" height="\d+"/,
      `class="nav-notion-icon"`
    )}
    <span>notion-enhancer</span>
  </h1>`;
  $notionNavItem.addEventListener('click', env.focusNotion);

  const $coreNavItem = web.html`<a href="?view=core" class="nav-item">core</a>`,
    $extensionsNavItem = web.html`<a href="?view=extensions" class="nav-item">extensions</a>`,
    $themesNavItem = web.html`<a href="?view=themes" class="nav-item">themes</a>`,
    $integrationsNavItem = web.html`<a href="?view=integrations" class="nav-item">integrations</a>`,
    $changelogNavItem = web.html`<button class="nav-item nav-changelog">
    ${await components.feather('clock', { class: 'nav-changelog-icon' })}
  </button>`;
  $changelogNavItem.addEventListener('click', () => {
    $changelogModal.scrollTop = 0;
    $changelogModal.classList.add('modal-visible');
  });

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
          $integrationsNavItem,
          web.html`<a href="https://notion-enhancer.github.io" target="_blank" class="nav-item">docs</a>`,
          web.html`<a href="https://discord.gg/sFWPXtA" target="_blank" class="nav-item">community</a>`,
          $changelogNavItem
        ),
        $main
      ),
      web.render($sidebar, $profile, $options)
    )
  );

  function selectNavItem($item) {
    for (const $selected of document.querySelectorAll('.nav-item-selected')) {
      $selected.className = 'nav-item';
    }
    $item.className = 'nav-item-selected';
  }

  await generators.modList(
    'core',
    `Core mods provide the basics required for
   all other extensions and themes to work. They
   can't be disabled, but they can be configured
   - just click on a mod to access its options.`
  );
  router.addView('core', async () => {
    web.empty($main);
    selectNavItem($coreNavItem);
    return web.render($main, await generators.modList('core'));
  });

  await generators.modList(
    'extension',
    `Extensions build on the functionality and layout of
   the Notion client, modifying and interacting with
   existing interfaces.`
  );
  router.addView('extensions', async () => {
    web.empty($main);
    selectNavItem($extensionsNavItem);
    return web.render($main, await generators.modList('extension'));
  });

  await generators.modList(
    'theme',
    `Themes change Notion's colour scheme.
   Dark themes will only work when Notion is in dark mode,
   and light themes will only work when Notion is in light mode.
   Only one theme of each mode can be enabled at a time.`
  );
  router.addView('themes', async () => {
    web.empty($main);
    selectNavItem($themesNavItem);
    return web.render($main, await generators.modList('theme'));
  });

  await generators.modList(
    'integration',
    web.html`<span class="danger">Integrations are extensions that use an unofficial API
   to access and modify content. They are used just like
   normal extensions, but may be more dangerous to use.</span>`
  );
  router.addView('integrations', async () => {
    web.empty($main);
    selectNavItem($integrationsNavItem);
    return web.render($main, await generators.modList('integration'));
  });

  router.setDefaultView('extensions');

  router.addQueryListener('id', openSidebarMenu);
  async function openSidebarMenu(id) {
    if (!id) return;
    id = web.escape(id);

    const deselectedMods = `.mod-selected:not([data-id="${id}"])`;
    for (const $list of Object.values($modLists)) {
      for (const $selected of $list.querySelectorAll(deselectedMods)) {
        $selected.className = 'mod';
      }
    }
    router.updateQuery(`?id=${id}`);

    if (id === 'profile') {
      openProfileMenu();
    } else openModMenu(id);
  }
})();
