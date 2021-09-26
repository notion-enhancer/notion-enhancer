/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import(chrome.runtime.getURL('api/_.mjs'));

// only load if user is logged into notion and viewing a page
// if (
//   localStorage['LRU:KeyValueStore2:current-user-id'] &&
//   location.pathname.split(/[/-]/g).reverse()[0].length === 32
// ) {
//   import(chrome.runtime.getURL('api.js')).then(async ({ web, registry }) => {
//     for (const mod of await registry.get((mod) => registry.isEnabled(mod.id))) {
//       for (const sheet of mod.css?.client || []) {
//         web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
//       }
//       for (const script of mod.js?.client || []) {
//         import(chrome.runtime.getURL(`repo/${mod._dir}/${script}`));
//       }
//     }
//     const errors = await registry.errors();
//     if (errors.length) {
//       console.log('notion-enhancer errors:');
//       console.table(errors);
//     }
//   });
// }
