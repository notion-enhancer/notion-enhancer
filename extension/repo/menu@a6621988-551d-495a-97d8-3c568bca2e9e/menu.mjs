/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// css-in-js for better component generation

import { tw, apply, setup } from '../../dep/twind.mjs';

const mapColorVariables = (color) => ({
  'text': `var(--theme--text_${color})`,
  'highlight': `var(--theme--highlight_${color})`,
  'highlight-text': `var(--theme--highlight_${color}-text)`,
  'block': `var(--theme--block_${color})`,
  'block-text': `var(--theme--block_${color}-text)`,
  'tag': `var(--theme--tag_${color})`,
  'tag-text': `var(--theme--tag_${color}-text)`,
  'callout': `var(--theme--callout_${color})`,
  'callout-text': `var(--theme--callout_${color}-text)`,
});

setup({
  preflight: {
    html: apply`w-full h-full`,
    body: apply`w-full h-full bg-notion-bg font-sans text-foreground`,
  },
  theme: {
    fontFamily: {
      sans: ['var(--theme--font_sans)'],
      mono: ['var(--theme--font_mono)'],
    },
    colors: {
      'notion': {
        'bg': 'var(--theme--bg)',
        'secondary': 'var(--theme--bg_secondary)',
        'popup': 'var(--theme--bg_popup)',
        'divider': 'var(--theme--ui_divider)',
      },
      'icon': 'var(--theme--icon)',
      'icon_ui': 'var(--theme--icon_ui)',
      'foreground': 'var(--theme--text)',
      'foreground_ui': 'var(--theme--text_ui)',
      'interactive': 'var(--theme--ui_interactive)',
      'interactive-hover': 'var(--theme--ui_interactive-hover)',
      'toggle': {
        'on': 'var(--theme--ui_toggle-on)',
        'off': 'var(--theme--ui_toggle-off)',
        'feature': 'var(--theme--ui_toggle-feature)',
      },
      'accent': {
        'blue': 'var(--theme--accent_blue)',
        'blue-contrast': 'var(--theme--accent_blue-text)',
        'red': 'var(--theme--accent_red)',
        'red-contrast': 'var(--theme--accent_red-text)',
      },
      'grey': mapColorVariables('grey'),
      'brown': mapColorVariables('brown'),
      'orange': mapColorVariables('orange'),
      'yellow': mapColorVariables('yellow'),
      'green': mapColorVariables('green'),
      'blue': mapColorVariables('blue'),
      'purple': mapColorVariables('purple'),
      'pink': mapColorVariables('pink'),
      'red': mapColorVariables('red'),
    },
  },
});

// initialisation and external interactions

import * as api from '../../api/_.mjs';
import { render } from '../../api/web.mjs';
const { env, fs, registry, web } = api,
  db = await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e');

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
  $container: web.html`<div class="${tw`absolute bottom-0 right-0 px-4 py-3 max-w-full w-96`}"></div>`,
  cache: await db.get(['notifications'], []),
  provider: [
    env.welcomeNotification,
    ...(await fs.getJSON('https://notion-enhancer.github.io/notifications.json')),
  ],
  add({ icon, message, id = undefined, color = undefined, link = undefined }) {
    const style = tw`p-2 ${
        color
          ? `bg-${color}-tag text-${color}-tag-text border border-${color}-text hover:bg-${color}-text`
          : 'bg-notion-popup text-foreground hover:bg-interactive-hover border border-notion-divider'
      } flex items-center rounded-full mt-3 shadow-md cursor-pointer`,
      $notification = web.render(
        link
          ? web.html`<a href="${web.escape(
              link
            )}" class="${style}" role="alert" target="_blank"></a>`
          : web.html`<p class="${style}" role="alert"></p>`,
        web.html`<span class="${tw`font-semibold mx-2 flex-auto`}">
            ${message}
          </span>`,
        web.html`${web.icon(icon, { class: tw`fill-current opacity-75 h-4 w-4 mx-2` })}`
      );
    $notification.addEventListener('click', async () => {
      if (id !== undefined) {
        notifications.cache.push(id);
        await db.set(['notifications'], notifications.cache);
      }
      $notification.remove();
    });
    web.render(notifications.$container, $notification);
  },
};
render(document.body, notifications.$container);
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

const $container = web.html`<div class="${tw`flex w-full h-full`}"></div>`,
  $nav = web.html`<nav class="${tw`px-4 py-3 flex items-center border-b border-notion-divider space-x-4`}"></nav>`,
  $main = web.html`<main class="${tw`transition px-4 py-3`}">abc</main>`,
  $footer = web.html`<footer></footer>`,
  $sidebar = web.html`<article class="${tw`h-full w-96 bg-notion-secondary border-l border-notion-divider`}"></article>`;

const $notion = web.html`<h1 class="${tw`flex items-center font-semibold text-xl cursor-pointer select-none mr-4`}">
    ${(await fs.getText('icon/colour.svg')).replace(
      /width="\d+" height="\d+"/,
      `class="${tw`h-6 w-6 mr-3`}"`
    )}
    <a href="https://notion-enhancer.github.io/" target="_blank">notion-enhancer</a>
  </h1>`;
$notion.children[0].addEventListener('click', env.focusNotion);

const navItemStyle = tw`px-3 py-2 rounded-md text-sm font-medium bg-interactive hover:bg-interactive-hover`,
  selectedNavItemStyle = tw`px-3 py-2 rounded-md text-sm font-medium ring-1 ring-notion-divider bg-notion-secondary`;

const $extensionsNavItem = web.html`<a href="?view=extensions" class="${navItemStyle}">extensions</a>`,
  $themesNavItem = web.html`<a href="?view=themes" class="${navItemStyle}">themes</a>`,
  $supportNavItem = web.html`<a href="https://discord.gg/sFWPXtA" class="${navItemStyle}">support</a>`;

web.render(
  document.body,
  web.render(
    $container,
    web.render(
      web.html`<div class="${tw`h-full flex-auto`}"></div>`,
      web.render($nav, $notion, $extensionsNavItem, $themesNavItem, $supportNavItem),
      $main,
      $footer
    ),
    $sidebar
  )
);

import * as router from './router.mjs';

router.addView('extensions', () => {
  $themesNavItem.className = navItemStyle;
  $extensionsNavItem.className = selectedNavItemStyle;
  web.empty($main);
  web.render($main, 123);
});
router.addView('themes', () => {
  $extensionsNavItem.className = navItemStyle;
  $themesNavItem.className = selectedNavItemStyle;
  web.empty($main);
  web.render($main, 456);
});
router.listen('extensions', $main);
