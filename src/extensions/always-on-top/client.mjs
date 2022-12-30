/**
 * notion-enhancer: always on top
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { createButton } from './button.mjs';

export default async function (api, db) {
  const { web } = api,
    topbarActionsSelector = '.notion-topbar-action-buttons';

  await web.whenReady([topbarActionsSelector]);
  const $topbarActions = document.querySelector(topbarActionsSelector),
    $button = await createButton(api, db);
  $topbarActions.after($button);
}
