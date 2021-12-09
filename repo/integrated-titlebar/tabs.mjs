/**
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import * as api from '../../api/index.mjs';
import { createWindowButtons } from './buttons.mjs';

(async () => {
  const db = await api.registry.db('a5658d03-21c6-4088-bade-fa4780459133'),
    { web } = api,
    windowActionsSelector = '#window-actions';

  await web.whenReady([windowActionsSelector]);
  // const $tabs = document.querySelector(topbarActionsSelector),
  //   $dragarea = web.html`<div class="integrated_titlebar--dragarea"></div>`;
  // $tabs.prepend($dragarea);
  // document.documentElement.style.setProperty(
  //   '--integrated_titlebar--dragarea-height',
  //   dragareaHeight + 'px'
  // );

  const $topbarActions = document.querySelector(windowActionsSelector),
    $windowButtons = await createWindowButtons(api, db);
  web.render($topbarActions, $windowButtons);
})();
