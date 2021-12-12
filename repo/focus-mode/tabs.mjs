/**
 * notion-enhancer: focus mode
 * (c) 2020 Arecsu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function (api, db) {
  if (await db.get(['tabs'])) document.body.dataset.focusMode = 'hide-tabs';
}
