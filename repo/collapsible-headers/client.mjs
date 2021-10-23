/*
 * notion-enhancer: collapsible headerrs
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web }, db) {
  const headerSelector = '.notion-page-content [class*="header-block"]',
    pageScroller = '.notion-frame > .notion-scroller.vertical.horizontal',
    haloClass = 'notion-selectable-halo',
    blockSelector = '.notion-selectable[data-block-id]',
    dividerClass = 'notion-divider-block',
    toggleClass = 'collapsible_headers--toggle',
    inlineToggleClass = 'collapsible_headers--inline';

  const togglePosition = await db.get(['position']),
    animateToggle = await db.get(['animate']),
    breakOnDividers = await db.get(['dividers']),
    toggleHotkey = await db.get(['hotkey']);

  const animationStyle = {
      duration: 250,
      easing: 'ease',
    },
    animationCollapsed = {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
      overflow: 'hidden',
    };

  let collapseParentsCache = new Map(),
    collapsedBlocksCache = new Map();

  const getHeaderLevel = ($block) => {
      if (!$block?.className?.includes?.('header-block')) return 9;
      return ($block.className.match(/sub_/gi)?.length || 0) + 1;
    },
    getSelectedHeaders = () => {
      return [...document.querySelectorAll(`${headerSelector} ${haloClass}`)]
        .map(($halo) => $halo.parentElement)
        .filter(($header) => $header.dataset.sectionCollapsed === 'true');
    },
    getHeaderSection = ($header) => {
      const blockList = [];
      let $nextBlock = $header?.nextElementSibling;
      // is this weird? yes
      // labels were the simplest way to do this tho
      blockLoop: while (true) {
        const isSectionEnd =
          !$nextBlock ||
          getHeaderLevel($nextBlock) <= getHeaderLevel($header) ||
          (breakOnDividers && $nextBlock?.classList?.contains(dividerClass));
        if (isSectionEnd) break;
        blockList.push($nextBlock);
        const $childBlock = $nextBlock.querySelector(blockSelector);
        if ($childBlock) {
          $nextBlock = $childBlock;
        } else if ($nextBlock.nextElementSibling) {
          $nextBlock = $nextBlock.nextElementSibling;
        } else {
          let $parentBlock = $nextBlock.parentElement.closest(blockSelector);
          while (!$parentBlock?.nextElementSibling) {
            if (!$parentBlock) break blockLoop;
            if ($parentBlock === $header.parentElement) break blockLoop;
            $parentBlock = $parentBlock.parentElement.closest(blockSelector);
          }
          $nextBlock = $parentBlock.nextElementSibling;
        }
      }
      return blockList;
    };

  const expandBlock = async ($header, $block, animate) => {
      const collapseParents = collapseParentsCache.get($block.dataset.blockId),
        expand = async () => {
          delete $block.dataset.collapsed;
          if (animate) {
            await $block.animate(
              [
                animationCollapsed,
                {
                  maxHeight: '100%',
                  opacity: 1,
                  marginTop: $block.style.marginTop,
                  marginBottom: $block.style.marginBottom,
                  overflow: 'hidden',
                },
              ],
              animationStyle
            ).finished;
          }
        };
      if (collapseParents) {
        collapseParents.delete($header.dataset.blockId);
        if (!collapseParents.size) await expand();
      } else await expand();
    },
    expandHeaderSection = async ($header, animate) => {
      const isBusy = $header.dataset.collapseAnimating,
        isCollapsibleHeader =
          $header.matches(headerSelector) && $header.dataset.sectionCollapsed === 'true';
      if (isBusy || !isCollapsibleHeader) return;
      $header.dataset.collapseAnimating = 'true';
      $header.dataset.sectionCollapsed = false;
      await db.set(['collapsed_ids', $header.dataset.blockId], false);

      const sectionContent = getHeaderSection($header),
        animations = [];
      for (const $block of sectionContent) {
        animations.push(expandBlock($header, $block, animate));
      }
      if ($header.dataset.collapsed) {
        const collapseParents = collapseParentsCache.get($header.dataset.blockId) || [];
        for (const parentId of collapseParents) {
          animations.push(
            expandHeaderSection(
              document.querySelector(`[data-block-id="${parentId}"]`),
              animate
            )
          );
        }
      }

      collapsedBlocksCache.set($header.dataset.blockId, undefined);
      await Promise.all(animations);
      delete $header.dataset.collapseAnimating;
    },
    collapseHeaderSection = async ($header, animate) => {
      const isBusy = $header.dataset.collapseAnimating,
        isCollapsibleHeader =
          $header.matches(headerSelector) && $header.dataset.sectionCollapsed === 'false';
      if (isBusy || !isCollapsibleHeader) return;
      $header.dataset.collapseAnimating = 'true';
      $header.dataset.sectionCollapsed = true;
      await db.set(['collapsed_ids', $header.dataset.blockId], true);

      const sectionContent = getHeaderSection($header),
        animations = [];
      collapsedBlocksCache.set($header.dataset.blockId, sectionContent);
      for (const $block of sectionContent) {
        if (!collapseParentsCache.get($block.dataset.blockId)) {
          collapseParentsCache.set($block.dataset.blockId, new Set());
        }
        const collapseParents = collapseParentsCache.get($block.dataset.blockId);
        collapseParents.add($header.dataset.blockId);

        if (animate) {
          animations.push(
            $block.animate(
              [
                {
                  maxHeight: $block.offsetHeight + 'px',
                  opacity: 1,
                  marginTop: $block.style.marginTop,
                  marginBottom: $block.style.marginBottom,
                  overflow: 'hidden',
                },
                animationCollapsed,
              ],
              animationStyle
            ).finished
          );
        }
        $block.dataset.collapsed = true;
      }
      await Promise.all(animations);

      delete $header.dataset.collapseAnimating;
    },
    toggleHeaderSection = async ($header, animate) => {
      if ($header.dataset.collapseAnimating) return;
      if ($header.dataset.sectionCollapsed === 'true') {
        const collapseParents = collapseParentsCache.get($header.dataset.blockId) ?? [];
        for (const $parent of collapseParents) {
          await expandHeaderSection($parent, animateToggle);
        }
        await expandHeaderSection($header, animate);
      } else await collapseHeaderSection($header, animate);
    };

  const insertToggles = async (event) => {
    if ([...event.addedNodes].some(($node) => $node?.matches(pageScroller))) {
      collapseParentsCache = new Map();
      collapsedBlocksCache = new Map();
      return;
    }

    const childNodeEvent =
      event.target.matches(blockSelector) && !event.target.matches(headerSelector);
    if (childNodeEvent) return;

    const removeHeaderEvent = [...event.removedNodes].filter(($node) =>
      $node?.className?.includes('header-blocks')
    );
    if (removeHeaderEvent.length) {
      return removeHeaderEvent.forEach(($header) => expandHeaderSection($header, false));
    }

    const toggleEvent =
      [...event.addedNodes, ...event.removedNodes].some(($node) =>
        $node?.classList?.contains(toggleClass)
      ) ||
      event.target.classList.contains(toggleClass) ||
      event.attributeName === 'data-collapsed' ||
      (event.target.classList.contains(inlineToggleClass) && event.attributeName === 'class');
    if (toggleEvent) return;

    const haloRemoveEvent =
      event.target.classList.contains(haloClass) ||
      [...event.removedNodes].some(($node) => $node?.classList?.contains(haloClass));
    if (haloRemoveEvent) return;

    for (const $header of document.querySelectorAll(headerSelector)) {
      const $nextBlock = $header.nextElementSibling,
        sectionContent = getHeaderSection($header),
        prevCollapseCache = collapsedBlocksCache.get($header.dataset.blockId) ?? [];

      let hasMoved =
        prevCollapseCache.length && prevCollapseCache.length !== sectionContent.length;
      for (const $collapsedBlock of prevCollapseCache) {
        if (hasMoved) break;
        if (!sectionContent.includes($collapsedBlock)) hasMoved = true;
      }
      if (hasMoved) {
        for (const $collapsedBlock of prevCollapseCache)
          expandBlock($header, $collapsedBlock, animateToggle);
        await db.set(['collapsed_ids', $header.dataset.blockId], false);
      }

      const isEmpty =
        !$nextBlock ||
        getHeaderLevel($nextBlock) <= getHeaderLevel($header) ||
        (breakOnDividers && $nextBlock.classList.contains(dividerClass));
      if (isEmpty) {
        delete $header.dataset.sectionCollapsed;
        $header.querySelector(`.${toggleClass}`)?.remove();
        continue;
      }

      if ($header.querySelector(`.${toggleClass}`)) continue;
      const $toggle = web.html`
          <div class="${toggleClass}">
            <svg viewBox="0 0 100 100"><polygon points="5.9,88.2 50,11.8 94.1,88.2"></polygon></svg>
          </div>
        `;
      if (togglePosition === 'left') {
        $header.firstChild.prepend($toggle);
      } else web.render($header.firstChild, $toggle);
      if (togglePosition === 'inline') $header.firstChild.classList.add(inlineToggleClass);

      $toggle.header = $header;
      $toggle.addEventListener('click', (ev) => {
        ev.stopPropagation();
        $header.querySelector('[contenteditable="true"]').click();
        toggleHeaderSection($header, animateToggle);
      });

      $header.dataset.sectionCollapsed = false;
      if (await db.get(['collapsed_ids', $header.dataset.blockId], false)) {
        await collapseHeaderSection($header, false);
      }
    }

    const haloAddedEvent =
        [...event.addedNodes].some(($node) => $node?.classList?.contains(haloClass)) &&
        event.target.matches(headerSelector),
      $selectedHeaders = new Set(getSelectedHeaders());
    if (haloAddedEvent) $selectedHeaders.add(event.target);
    for (const $header of $selectedHeaders) {
      expandHeaderSection($header, animateToggle);
    }
  };
  web.addDocumentObserver(insertToggles, ['.notion-page-content', headerSelector]);

  web.addHotkeyListener(toggleHotkey, (event) => {
    const $header = document.activeElement.closest(headerSelector);
    if ($header) {
      toggleHeaderSection($header, animateToggle);
    } else {
      getSelectedHeaders().forEach(($header) => toggleHeaderSection($header, animateToggle));
    }
  });
}
