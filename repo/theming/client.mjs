/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, registry, storage, electron }, db) {
  const enabledThemes = await registry.list(
    async (m) => (await registry.enabled(m.id)) && m.tags.includes('theme')
  );
  if (enabledThemes.length || (await db.get(['force_load']))) {
    // only override colors if theme is enable for perf
    web.loadStylesheet('repo/theming/theme.css');
    web.loadStylesheet('repo/theming/colors.css');
  }

  const updateTheme = async () => {
    await storage.set(
      ['theme'],
      document.querySelector('.notion-dark-theme') ? 'dark' : 'light'
    );
    const mode = await storage.get(['theme'], 'light'),
      inactive = mode === 'light' ? 'dark' : 'light';
    document.documentElement.classList.add(mode);
    document.documentElement.classList.remove(inactive);
    electron.sendMessage('update-theme');
    const searchThemeVars = [
      'bg',
      'text',
      'icon',
      'icon_secondary',
      'accent_blue',
      'accent_blue-text',
      'accent_blue-hover',
      'accent_blue-active',
      'ui_shadow',
      'ui_divider',
      'ui_input',
      'ui_interactive-hover',
      'ui_interactive-active',
    ].map((key) => [
      key,
      window.getComputedStyle(document.documentElement).getPropertyValue(`--theme--${key}`),
    ]);
    electron.sendMessage('set-search-theme', searchThemeVars);
  };
  web.addDocumentObserver((mutation) => {
    const potentialThemeChange = [document.body, document.documentElement].includes(
      mutation.target
    );
    if (potentialThemeChange && document.hasFocus()) updateTheme();
  });
  updateTheme();
  document.addEventListener('visibilitychange', updateTheme);
}
