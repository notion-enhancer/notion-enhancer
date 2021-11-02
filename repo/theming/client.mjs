/*
 * notion-enhancer core: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, registry }, db) {
  const enabledThemes = await registry.list(
    async (m) => (await registry.enabled(m.id)) && m.tags.includes('theme')
  );
  if (enabledThemes.length || (await db.get(['force_load']))) {
    // only override colors if theme is enable for perf
    web.loadStylesheet('repo/theming/theme.css');
    web.loadStylesheet('repo/theming/colors.css');
  }

  const updateTheme = () =>
    document.documentElement.classList[
      document.body.classList.contains('dark') ? 'add' : 'remove'
    ]('dark');
  updateTheme();
  web.addDocumentObserver((mutation) => {
    if (mutation.target === document.body) updateTheme();
  });
}
