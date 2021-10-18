/*
 * notion-enhancer: topbar icons
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, components }, db) {
  await web.whenReady(['.notion-topbar-action-buttons']);

  if ((await db.get(['share'])) === true) {
    const $share = document.querySelector('.notion-topbar-share-menu');
    $share.innerHTML = await components.feather('share-2', {
      style: 'width:16px;height:16px;color:var(--theme--icon);',
    });
  }

  const styleTextButton = ($btn) => {
    $btn.style.width = 'auto';
    $btn.style.fontSize = '14px';
    $btn.style.lineHeight = '1.2';
    $btn.style.paddingLeft = '8px';
    $btn.style.paddingRight = '8px';
  };

  if ((await db.get(['comments'])) === false) {
    const $comments = document.querySelector('.notion-topbar-comments-button');
    styleTextButton($comments);
    $comments.innerHTML = 'Comments';
  }

  if ((await db.get(['updates'])) === false) {
    const $updates = document.querySelector('.notion-topbar-updates-button');
    styleTextButton($updates);
    $updates.innerHTML = 'Updates';
  }

  if ((await db.get(['favorite'])) === false) {
    const $favorite = document.querySelector(
      '.notion-topbar-updates-button + [aria-label^="Fav"]'
    );
    styleTextButton($favorite);
    $favorite.innerHTML = $favorite.ariaLabel;
    $favorite.addEventListener('click', async () => {
      await new Promise((res, rej) => requestAnimationFrame(res));
      $favorite.innerHTML = $favorite.ariaLabel;
    });
  }

  if ((await db.get(['more'])) === false) {
    const $more = document.querySelector('.notion-topbar-more-button');
    styleTextButton($more);
    $more.innerHTML = 'More';
  }
}
