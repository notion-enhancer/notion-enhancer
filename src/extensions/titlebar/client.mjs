/**
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

import { TopbarButton } from "../../core/islands/TopbarButton.mjs";

// import { createWindowButtons } from './buttons.mjs';

export default async function ({ html }, db) {
  const topbarMore = ".notion-topbar-more-button";
  const $minimizeButton = html`<${TopbarButton}
      aria-label="Minimize window"
      icon="minus"
    />`,
    $maximizeButton = html`<${TopbarButton}
      aria-label="Maximize window"
      icon="maximize"
    />`,
    $unmaximizeButton = html`<${TopbarButton}
      aria-label="Unmaximize window"
      icon="minimize"
    />`,
    $closeButton = html`<${TopbarButton} aria-label="Close window" icon="x" />`;
  $closeButton.addToTopbar(topbarMore);
  $maximizeButton.addToTopbar(topbarMore);
  $minimizeButton.addToTopbar(topbarMore);
}
