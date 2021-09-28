/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// css-in-js for better component generation

import { tw, apply, setup } from '../../dep/twind.mjs';
import { content } from '../../dep/twind-content.mjs';
const pseudoContent = content('""');

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
        'input': 'var(--theme--ui_input)',
      },
      'icon': 'var(--theme--icon)',
      'icon-ui': 'var(--theme--icon_ui)',
      'foreground': 'var(--theme--text)',
      'foreground-ui': 'var(--theme--text_ui)',
      'interactive': 'var(--theme--ui_interactive)',
      'interactive-hover': 'var(--theme--ui_interactive-hover)',
      'tag': 'var(--theme--tag_default)',
      'tag-text': 'var(--theme--tag_default-text)',
      'toggle': {
        'on': 'var(--theme--ui_toggle-on)',
        'off': 'var(--theme--ui_toggle-off)',
        'feature': 'var(--theme--ui_toggle-feature)',
      },
      'accent': {
        'blue': 'var(--theme--accent_blue)',
        'blue-hover': 'var(--theme--accent_blue-hover)',
        'blue-active': 'var(--theme--accent_blue-active)',
        'blue-text': 'var(--theme--accent_blue-text)',
        'red': 'var(--theme--accent_red)',
        'red-hover': 'var(--theme--accent_red-hover)',
        'red-text': 'var(--theme--accent_red-text)',
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
    extend: {
      maxHeight: {
        'full-16': 'calc(100% - 4rem)',
      },
    },
  },
});

// initialisation and external interactions

import * as api from '../../api/_.mjs';
import { render } from '../../api/web.mjs';
const { env, fmt, fs, registry, storage, web } = api,
  db = await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e'),
  profile = await storage.get(['currentprofile'], 'default');

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
          : 'bg-tag text-tag-text hover:bg-interactive-hover border border-notion-divider'
      } flex items-center rounded-full mt-3 shadow-md cursor-pointer`,
      $notification = web.render(
        link
          ? web.html`<a href="${web.escape(
              link
            )}" class="${style}" role="alert" target="_blank"></a>`
          : web.html`<p class="${style}" role="alert" tabindex="0"></p>`,
        web.html`<span class="${tw`font-semibold mx-2 flex-auto`}">
            ${message}
          </span>`,
        web.html`${web.icon(icon, { class: tw`fill-current opacity-75 h-4 w-4 mx-2` })}`
      ),
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

const $container = web.html`<div class="${tw`flex w-full h-full overflow-hidden`}"></div>`,
  $nav = web.html`<nav class="${tw`px-4 py-3 flex items-center border-b border-notion-divider space-x-4 h-16`}"></nav>`,
  $main = web.html`<main class="${tw`transition px-4 py-3 overflow-y-auto max-h-full-16`}">abc</main>`,
  // $footer = web.html`<footer></footer>`,
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

const $coreNavItem = web.html`<a href="?view=core" class="${navItemStyle}">core</a>`,
  $extensionsNavItem = web.html`<a href="?view=extensions" class="${navItemStyle}">extensions</a>`,
  $themesNavItem = web.html`<a href="?view=themes" class="${navItemStyle}">themes</a>`,
  $supportNavItem = web.html`<a href="https://discord.gg/sFWPXtA" class="${navItemStyle}">support</a>`;

web.render(
  document.body,
  web.render(
    $container,
    web.render(
      web.html`<div class="${tw`h-full flex-auto w-min`}"></div>`,
      web.render(
        $nav,
        $notion,
        $coreNavItem,
        $extensionsNavItem,
        $themesNavItem,
        $supportNavItem
      ),
      $main
      // $footer
    ),
    $sidebar
  )
);

const components = {
  preview: (url) => web.html`<img
    class="${tw`object-cover w-full h-32`}"
    src="${web.escape(url)}"
    alt=""
  />`,
  title: (title) => {
    const style = tw`mb-2 text-xl font-semibold tracking-tight flex items-center`;
    return web.html`<h4 class="${style}"><span>${web.escape(title)}</span></h4>`;
  },
  version: (version) => {
    const style = tw`mt-px ml-3 p-1 font-normal text-xs leading-none bg-tag text-tag-text rounded`;
    return web.html`<span class="${style}">v${web.escape(version)}</span>`;
  },
  tags: (tags) => {
    if (!tags.length) return '';
    return web.render(
      web.html`<p class="${tw`text-foreground-ui mb-2 text-xs`}"></p>`,
      tags.map((tag) => `#${web.escape(tag)}`).join(' ')
    );
  },
  description: (description) => {
    return web.html`<p class="${tw`mb-2 text-sm`} enhancer--markdown">
      ${fmt.md.renderInline(description)}
    </p>`;
  },
  authors: (authors) => {
    const author = (author) => web.html`<a class="${tw`flex items-center mb-2`}"
      href="${web.escape(author.homepage)}"
    >
      <img class="${tw`inline object-cover w-5 h-5 rounded-full mr-2`}"
        src="${web.escape(author.avatar)}" alt="${web.escape(author.name)}'s avatar"
      /> <span>${web.escape(author.name)}</span>
    </a>`;
    return web.render(
      web.html`<p class="${tw`text-sm font-medium`}"></p>`,
      ...authors.map(author)
    );
  },
  toggle: (
    checked,
    {
      customLabelStyle = '',
      customCheckStyle = '',
      customBoxStyle = '',
      customFeatureStyle = '',
    }
  ) => {
    const checkStyle = tw`appearance-none checked:sibling:(bg-toggle-on after::translate-x-4) ${customCheckStyle}`,
      boxStyle = tw`w-9 h-5 p-0.5 flex items-center bg-toggle-off rounded-full duration-300 ease-in-out ${customBoxStyle}`,
      featureStyle = tw`after::(${pseudoContent} w-4 h-4 bg-toggle-feature rounded-full duration-300) ${customFeatureStyle}`,
      $label = web.html`<label tabindex="0" class="${tw`relative text-sm ${customLabelStyle}`}"></label>`,
      $input = web.html`<input tabindex="-1" type="checkbox" class="${checkStyle}" ${
        checked ? 'checked' : ''
      }/>`;
    $label.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) {
        $input.checked = !$input.checked;
      }
    });
    return web.render(
      $label,
      $input,
      web.html`<span class="${boxStyle} ${featureStyle}"></span>`
    );
  },
};

components.mod = async (mod) => {
  const $toggle = components.toggle(await registry.enabled(mod.id), {
    customLabelStyle: 'flex w-full mt-auto',
    customCheckStyle: 'ml-auto',
  });
  $toggle.addEventListener('change', (event) => {
    storage.set(['profiles', profile, '_mods', mod.id], event.target.checked);
  });
  const style = tw`relative h-full w-full flex flex-col overflow-hidden rounded-lg shadow-lg
    bg-notion-secondary border border-notion-divider`;
  return web.render(
    web.html`<article class="${tw`w-1/3 px-2.5 py-2.5 box-border`}"></article>`,
    web.render(
      web.html`<div class="${style}"></div>`,
      mod.preview
        ? components.preview(
            mod.preview.startsWith('http')
              ? mod.preview
              : fs.localPath(`repo/${mod._dir}/${mod.preview}`)
          )
        : '',
      web.render(
        web.html`<div class="${tw`px-4 py-3 flex flex-col flex-auto`}"></div>`,
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
  const $search = web.html`<input type="search" class="${tw`transition block w-full px-3 py-2 text-sm rounded-md flex
    bg-notion-input text-foreground
    hover:(ring ring-accent-blue-hover) focus:(outline-none ring ring-accent-blue-active)`}"
    placeholder="Search ('/' to focus)">`,
    $list = web.html`<div class="${tw`flex flex-wrap`}"></div>`,
    mods = await registry.list(
      (mod) => mod.environments.includes(env.name) && mod.tags.includes(category)
    );
  web.addHotkeyListener(['/'], () => $search.focus());
  $search.addEventListener('input', (event) => {
    const query = $search.value.toLowerCase(),
      hiddenStyle = tw`hidden`;
    for (const $mod of $list.children) {
      const matches = !query || $mod.innerText.toLowerCase().includes(query);
      $mod.classList[matches ? 'remove' : 'add'](hiddenStyle);
    }
  });
  for (const mod of mods) {
    mod.tags = mod.tags.filter((tag) => tag !== category);
    web.render($list, await components.mod(mod));
    mod.tags.unshift(category);
  }
  return web.render(
    web.html`<div></div>`,
    web.render(web.html`<div class="${tw`mx-2.5 my-2.5`}"></div>`, $search),
    $list
  );
};

import * as router from './router.mjs';

router.addView('core', async () => {
  $extensionsNavItem.className = navItemStyle;
  $themesNavItem.className = navItemStyle;
  $coreNavItem.className = selectedNavItemStyle;
  web.empty($main);
  return web.render($main, await components.modList('core'));
});

router.addView('extensions', async () => {
  $coreNavItem.className = navItemStyle;
  $themesNavItem.className = navItemStyle;
  $extensionsNavItem.className = selectedNavItemStyle;
  web.empty($main);
  return web.render($main, await components.modList('extension'));
});

router.addView('themes', async () => {
  $coreNavItem.className = navItemStyle;
  $extensionsNavItem.className = navItemStyle;
  $themesNavItem.className = selectedNavItemStyle;
  web.empty($main);
  return web.render($main, await components.modList('theme'));
});

router.loadView('extensions', $main);
