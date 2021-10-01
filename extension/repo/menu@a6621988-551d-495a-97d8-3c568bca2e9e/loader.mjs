/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import * as _api from '../../api/_.mjs';
export const api = { ..._api },
  { fs, registry, web } = api;

export const db = await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e'),
  profileName = await registry.profileName(),
  profileDB = await registry.profileDB();

const insert = (mod) => {
  for (const sheet of mod.css?.menu || []) {
    web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
  }
};
for (const mod of await registry.list((mod) => registry.core.includes(mod.id))) {
  if (mod.js?.hook) {
    let script = mod.js.hook;
    script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
    api[mod.name] = await script.default(api, await registry.db(mod.id));
  }
  await insert(mod);
}
for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
  if (!registry.core.includes(mod.id)) await insert(mod);
}
