/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web, fs, registry } from '../../helpers.js';

for (let mod of await registry.get()) {
  for (let sheet of mod.css?.menu || []) {
    web.loadStyleset(`repo/${mod._dir}/${sheet}`);
  }
}

const tabs = ['library', 'alerts', 'documentation'].map((tab) => ({
  title: document.querySelector(`header [data-target="${tab}"]`),
  container: document.querySelector(`main [data-container="${tab}"]`),
}));
tabs.forEach((tab) => {
  tab.title.addEventListener('click', (event) => {
    tabs.forEach((_tab) => {
      _tab.title.removeAttribute('data-active');
      _tab.container.removeAttribute('data-active');
    });
    tab.title.dataset.active = true;
    tab.container.dataset.active = true;
  });
});

// registry.errors().then((err) => {
//   document.querySelector('[data-section="alerts"]').innerHTML = JSON.stringify(err);
// });
