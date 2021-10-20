/*
 * notion-enhancer: topbar icons
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, components }, db) {
  await web.whenReady(['.notion-topbar-action-buttons']);

  const observeButton = (selector, label = '') => {
    const updateButton = () => {
      const $btns = document.querySelectorAll(selector);
      $btns.forEach(($btn) => {
        $btn.style.width = 'auto';
        $btn.style.fontSize = '14px';
        $btn.style.lineHeight = '1.2';
        $btn.style.paddingLeft = '8px';
        $btn.style.paddingRight = '8px';
        const innerHTML = label || $btn.ariaLabel;
        if ($btn.innerHTML !== innerHTML) $btn.innerHTML = innerHTML;
      });
    };
    web.addDocumentObserver(updateButton, [selector]);
    updateButton();
  };

  if ((await db.get(['share'])) === true) {
    const selector = '.notion-topbar-share-menu',
      label = await components.feather('share-2', {
        style: 'width:16px;height:16px;color:var(--theme--icon);',
      });
    observeButton(selector, label);
  }

  if ((await db.get(['comments'])) === false) {
    const selector = '.notion-topbar-comments-button';
    observeButton(selector);
  }

  if ((await db.get(['updates'])) === false) {
    const selector =
      '.notion-topbar-updates-button, .notion-topbar-share-menu ~ [aria-label="Updates"]';
    observeButton(selector);
  }

  if ((await db.get(['favorite'])) === false) {
    const selector = '.notion-topbar-share-menu ~ [aria-label^="Fav"]';
    observeButton(selector);
  }

  if ((await db.get(['more'])) === false) {
    const selector = '.notion-topbar-more-button',
      label = 'More';
    observeButton(selector, label);
  }
}
