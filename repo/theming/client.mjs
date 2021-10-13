/*
 * notion-enhancer core: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default function ({ web }, db) {
  const updateTheme = () =>
    document.documentElement.classList[
      document.body.classList.contains('dark') ? 'add' : 'remove'
    ]('dark');
  updateTheme();
  web.addDocumentObserver((mutation) => {
    if (mutation.target === document.body) updateTheme();
  });
}
