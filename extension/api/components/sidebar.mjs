/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * notion-style elements inc. the sidebar
 * @module notion-enhancer/api/components/side-panel
 */

import { web } from '../_.mjs';

let _$sidebar;

export const sidebar = (icon, name, loader = ($panel) => {}) => {
  if (!_$sidebar) {
    web.loadStylesheet('api/components/sidebar.css');
    _$sidebar = web.html`<div id="enhancer--sidebar"></div>`;
    web.render(document.body, _$sidebar);
  }
};
