/*
 * notion-enhancer: global block links
 * (c) 2021 admiraldus (https://github.com/admiraldus)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, components, notion }, db) {
  const topbarShareSelector = '.notion-topbar-share-menu',
    blockActionSelector =
      '.notion-overlay-container .notion-scroller.vertical .notion-focusable > div > div > [style*="text-overflow: ellipsis;"]',
    hoveredActionSelector =
      '.notion-overlay-container .notion-scroller.vertical .notion-focusable[style*="background:"]',
    topbarCopyClass = 'global_block_links--topbar_copy',
    blockCopyClass = 'global_block_links--block_copy',
    hiddenClass = 'global_block_links--hidden';

  if (await db.get(['topbar_copy'])) {
    const $topbarCopyTemplate = web.html`
      <div class="${topbarCopyClass}" role="button" tabindex="0">
        <svg viewBox="0 0 30 30">
          <path d="M2,12c0-3.309,2.691-6,6-6h8c3.309,0,6,2.691,6,6s-2.691,6-6,6h-6c0,0.736,
          0.223,1.41,0.574,2H16c4.418,0,8-3.582,8-8 c0-4.418-3.582-8-8-8H8c-4.418,0-8,3.582-8,
          8c0,2.98,1.634,5.575,4.051,6.951C4.021,18.638,4,18.321,4,18 c0-0.488,0.046-0.967,
          0.115-1.436C2.823,15.462,2,13.827,2,12z M25.953,11.051C25.984,11.363,26,11.68,26,12
          c0,0.489-0.047,0.965-0.117,1.434C27.176,14.536,28,16.172,28,18c0,3.309-2.691,6-6,6h-8c-3.309,
          0-6-2.691-6-6s2.691-6,6-6h6 c0-0.731-0.199-1.413-0.545-2H14c-4.418,0-8,3.582-8,8c0,4.418,3.582,8,8,
          8h8c4.418,0,8-3.582,8-8 C30,15.021,28.368,12.428,25.953,11.051z"></path>
        </svg>
        <span>Copy link</span>
        <span class="${hiddenClass}">Link copied!</span>
      </div>`;

    const insertTopbarCopy = () => {
      const $btns = document.querySelectorAll(topbarShareSelector);
      $btns.forEach(($btn) => {
        if (!$btn.previousElementSibling?.classList?.contains?.(topbarCopyClass)) {
          const $copy = $topbarCopyTemplate.cloneNode(true);
          $btn.before($copy);

          let resetButtonDelay;
          $copy.addEventListener('click', () => {
            $copy.children[1].classList.add(hiddenClass);
            $copy.lastElementChild.classList.remove(hiddenClass);
            clearTimeout(resetButtonDelay);
            resetButtonDelay = setTimeout(() => {
              $copy.children[1].classList.remove(hiddenClass);
              $copy.lastElementChild.classList.add(hiddenClass);
            }, 1250);

            web.copyToClipboard(`https://notion.so/${notion.getPageID().replace(/-/g, '')}`);
          });
        }
      });
    };
    insertTopbarCopy();
    web.addDocumentObserver(insertTopbarCopy, [topbarShareSelector]);
  }

  const $blockCopyTemplate = web.html`
    <div class="${blockCopyClass}" role="button" tabindex="0">
      ${await components.feather('globe')}
      <span>Global link</span>
    </div>`;

  const getLinkButtons = () =>
      [...document.querySelectorAll(blockActionSelector)]
        .filter(($action) =>
          ['Copy link', '링크 복사', 'リンクをコピー'].includes($action.textContent)
        )
        .map(($action) => $action.closest('.notion-focusable')),
    insertBlockCopy = () => {
      const $btns = getLinkButtons();
      $btns.forEach(($btn) => {
        if (!$btn.previousElementSibling?.classList?.contains?.(blockCopyClass)) {
          const $copy = $blockCopyTemplate.cloneNode(true);
          $btn.before($copy);

          $copy.addEventListener('mouseover', () => {
            document.querySelectorAll(hoveredActionSelector).forEach(($action) => {
              $action.style.background = '';
            });
          });

          $copy.addEventListener('click', async () => {
            $btn.click();
            const link = await web.readFromClipboard(),
              id = link.replace(/.+#(?=\w+)/, '');
            web.copyToClipboard(id.length === 32 ? `https://notion.so/${id}` : link);
          });
        }
      });
    };
  insertBlockCopy();
  web.addDocumentObserver(insertBlockCopy, [blockActionSelector]);
}
