/*
 * notion-enhancer core: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web } from '../../api.js';

const $root = document.querySelector(':root');
web.addDocumentObserver((mutation) => {
  if (mutation.target === document.body) {
    $root.classList[document.body.classList.contains('dark') ? 'add' : 'remove']('dark');
  }
});
