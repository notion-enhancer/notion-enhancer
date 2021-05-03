/*
 * notion-enhancer: custom-inserts
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const _id = 'b4b0aced-2059-43bf-8d1d-ccd757ee5ebb';
import { env, storage, web } from '../../helpers.js';

const inserts = {
  js: await storage.get(_id, '_file.js'),
  css: await storage.get(_id, '_file.css'),
};

if (inserts.js) {
  // eval(inserts.js);
}

if (inserts.css) {
  document.body.append(
    web.createElement(web.html`<style id="custom-inserts@${_id}.css">${inserts.css}</style>`)
  );
}
