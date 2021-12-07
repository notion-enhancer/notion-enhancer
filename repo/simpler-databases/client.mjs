/**
 * notion-enhancer: simpler databases
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, components }, db) {
  const collectionViewSelector =
      '.notion-collection_view-block[style*="width"][style*="max-width"]',
    collectionAddNewSelector = '.notion-collection-view-item-add',
    collectionToolbarSelector = '[style*=" height: 42px"]',
    linkedCollectionTitleSelector = `${collectionToolbarSelector} > a [placeholder]`,
    viewContainerSelector = '.notion-scroller [class$="view"]',
    configButtonClass = 'simpler_databases--config_button',
    configButtonSvg = web.raw`<svg viewBox="0 0 14 14">
      <path d="M14,7.77 L14,6.17 L12.06,5.53 L11.61,4.44 L12.49,2.6 L11.36,1.47
        L9.55,2.38 L8.46,1.93 L7.77,0.01 L6.17,0.01 L5.54,1.95 L4.43,2.4 L2.59,1.52
        L1.46,2.65 L2.37,4.46 L1.92,5.55 L0,6.23 L0,7.82 L1.94,8.46 L2.39,9.55
        L1.51,11.39 L2.64,12.52 L4.45,11.61 L5.54,12.06 L6.23,13.98 L7.82,13.98
        L8.45,12.04 L9.56,11.59 L11.4,12.47 L12.53,11.34 L11.61,9.53 L12.08,8.44
        L14,7.75 L14,7.77 Z M7,10 C5.34,10 4,8.66 4,7 C4,5.34 5.34,4 7,4 C8.66,4
        10,5.34 10,7 C10,8.66 8.66,10 7,10 Z" />
      </svg>`,
    overlayContainerClass = 'simpler_databases--overlay_container',
    configMenuClass = 'simpler_databases--config_menu',
    configDividerClass = 'simpler_databases--config_divider',
    configItemClass = 'simpler_databases--config_item',
    configTitleClass = 'simpler_databases--config_title',
    configToggleClass = 'simpler_databases--config_toggle',
    configInputClassName = 'simpler_databases--config_input notion-focusable',
    configOpenCollectionSelector =
      '.notion-collection_view-block[data-simpler-db-tweaks*="[config-open]"]',
    collectionToggleClass = 'simpler_databases--toggle',
    notionAppSelector = '.notion-app-inner';

  const replaceTitle = ($collection, state) => {
      const $title = $collection.querySelector(linkedCollectionTitleSelector),
        blockId = $collection.dataset.blockId;
      if (!$title) return;
      if (!$title.dataset.originalTitle && state) {
        $title.dataset.originalTitle = $title.innerText;
      }

      if (!$title.titleObserver) {
        if (!state) return;
        $title.titleObserver = new MutationObserver(async () => {
          const customTitle = await db.get(['collections', blockId, 'replace_title'], false);
          if (customTitle && $title.innerText !== customTitle) $title.innerText = customTitle;
        });
      } else $title.titleObserver.disconnect();

      if (state) {
        // observe
        $title.innerText = state;
        $title.titleObserver.observe($title, { characterData: true, childList: true });
      } else {
        // reset
        $title.titleObserver.disconnect();
        $title.innerText = $title.dataset.originalTitle;
        delete $title.dataset.originalTitle;
      }
    },
    insertToggle = async ($collection, state) => {
      const datasetKey = 'simplerDbToggleHidden',
        blockId = $collection.dataset.blockId,
        $toolbar = $collection.querySelector(collectionToolbarSelector);
      if (!$toolbar) return;

      const $collectionView = $collection.querySelector('.notion-scroller'),
        hideCollection = () => {
          $collectionView.style.height = $collectionView.offsetHeight + 'px';
          requestAnimationFrame(() => {
            $collection.dataset[datasetKey] = true;
            setTimeout(() => ($collectionView.dataset.simplerDbHideItems = 'true'), 200); // hide drag handles
          });
        },
        showCollection = () => {
          $collection.dataset[datasetKey] = false;
          $collectionView.style.height = '';
          $collectionView.style.height = $collectionView.offsetHeight + 'px';
          $collection.dataset[datasetKey] = true;

          delete $collectionView.dataset.simplerDbHideItems;
          requestAnimationFrame(() => {
            $collection.dataset[datasetKey] = false;
            setTimeout(() => ($collectionView.style.height = ''), 200);
          });
        };

      if (!$collection.dataset[datasetKey]) {
        const storedState = await db.get(['collections', blockId, 'toggle_hidden'], false);
        if (storedState) {
          hideCollection();
        }
      }

      let $toggle = $toolbar.querySelector(`.${collectionToggleClass}`);
      if ($toggle) {
        if (!state) $toggle.remove();
        return;
      } else if (state) {
        $toggle = web.html`
          <div class="${collectionToggleClass}">
            <svg viewBox="0 0 100 100"><polygon points="5.9,88.2 50,11.8 94.1,88.2" /></svg>
          </div>
        `;
        $toggle.addEventListener('click', async () => {
          const hide = !($collection.dataset[datasetKey] === 'true');
          await db.set(['collections', blockId, 'toggle_hidden'], hide);
          if (hide) {
            hideCollection();
          } else showCollection();
        });
        $toolbar.prepend($toggle);
      }
    };

  const menuItems = [
    {
      key: 'replace_title',
      name: 'Replace title...',
      type: 'input',
      linkedOnly: true,
      default: '',
      action: replaceTitle,
    },
    {
      key: 'icon',
      name: 'Icon',
      type: 'toggle',
      default: true,
    },
    {
      key: 'title',
      name: 'Title',
      type: 'toggle',
      default: true,
    },
    {
      key: 'toggle',
      name: 'Toggle',
      type: 'toggle',
      default: false,
      action: insertToggle,
    },
    {
      key: 'views',
      name: 'Views',
      type: 'toggle',
      default: true,
    },
    {
      key: 'toolbar',
      name: 'Toolbar',
      type: 'toggle',
      default: true,
    },
    {
      key: 'divider',
      views: ['table', 'board', 'timeline', 'list', 'gallery'],
    },
    {
      key: 'header_row',
      name: 'Header row',
      type: 'toggle',
      default: true,
      views: ['table'],
    },
    {
      key: 'new_item',
      name: 'New row',
      type: 'toggle',
      default: true,
      views: ['table', 'timeline'],
    },
    {
      key: 'new_item',
      name: 'New item',
      type: 'toggle',
      default: true,
      views: ['board', 'list', 'gallery'],
    },
    {
      key: 'calc_row',
      name: 'Calculation row',
      type: 'toggle',
      default: true,
      views: ['table', 'timeline'],
    },
    {
      key: 'divider',
      views: ['table', 'board'],
    },
    {
      key: 'hidden_column',
      name: 'Hidden columns',
      type: 'toggle',
      default: true,
      views: ['board'],
    },
    {
      key: 'add_group',
      name: 'Add group',
      type: 'toggle',
      default: true,
      views: ['board'],
    },
    {
      key: 'new_column',
      name: 'New column',
      type: 'toggle',
      default: true,
      views: ['table'],
    },
    {
      key: 'full_width',
      name: 'Full width',
      type: 'toggle',
      default: true,
      views: ['table'],
    },
  ];

  const isLinked = ($collection) => !!$collection.querySelector(linkedCollectionTitleSelector),
    getViewType = ($collection) =>
      $collection.querySelector(viewContainerSelector)?.className.split('-')[1],
    setTweakState = ($collection, key, state) => {
      const datasetKey = 'simplerDbTweaks';
      if (!$collection.dataset[datasetKey]) $collection.dataset[datasetKey] = '';

      key = web.escape(key);
      const isActive = $collection.dataset[datasetKey].includes(`[${key}]`);

      if (state && !isActive) {
        $collection.dataset[datasetKey] += `[${key}]`;
      } else if (!state && isActive) {
        const prev = $collection.dataset[datasetKey];
        $collection.dataset[datasetKey] = prev.replace(`[${key}]`, '');
      }
    };

  const clickItem = (event) => {
      event.stopPropagation();
      const focusedItem = event.target.closest(`[class^="${configItemClass}"]`);
      if (focusedItem) focusedItem.click();
    },
    focusNextItem = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const $focusedItem = event.target.closest(`[class^="${configItemClass}"]`);
      if (!$focusedItem) return;
      let $targetItem = $focusedItem.nextElementSibling;
      if (!$targetItem) $targetItem = $focusedItem.parentElement.firstElementChild;
      if ($targetItem.classList.contains(configDividerClass)) {
        $targetItem = $targetItem.nextElementSibling;
      }
      const $input = $targetItem.querySelector('input');
      if ($input) {
        $input.focus();
      } else $targetItem.focus();
    },
    focusPrevItem = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const $focusedItem = event.target.closest(`[class^="${configItemClass}"]`);
      if (!$focusedItem) return;
      let $targetItem = $focusedItem.previousElementSibling;
      if (!$targetItem) $targetItem = $focusedItem.parentElement.lastElementChild;
      if ($targetItem.classList.contains(configDividerClass)) {
        $targetItem = $targetItem.previousElementSibling;
      }
      const $input = $targetItem.querySelector('input');
      if ($input) {
        $input.focus();
      } else $targetItem.focus();
    },
    keyListeners = [
      {
        keys: ['Escape'],
        listener: (event) => {
          event.stopPropagation();
          hideConfig();
        },
        opts: { listenInInput: true, keydown: true },
      },
      {
        keys: [' '],
        listener: (event) => clickItem(event),
        opts: { keydown: true },
      },
      {
        keys: ['Enter'],
        listener: (event) => clickItem(event),
        opts: { keydown: true },
      },
      {
        keys: ['ArrowDown'],
        listener: focusNextItem,
        opts: { listenInInput: true, keydown: true },
      },
      {
        keys: ['ArrowUp'],
        listener: focusPrevItem,
        opts: { listenInInput: true, keydown: true },
      },
      {
        keys: ['Tab'],
        listener: focusNextItem,
        opts: { listenInInput: true, keydown: true },
      },
      {
        keys: ['Shift', 'Tab'],
        listener: focusPrevItem,
        opts: { listenInInput: true, keydown: true },
      },
    ];

  const renderConfigItem = async ($collection, menuItem) => {
      if (menuItem.key === 'divider')
        return web.html`<div class="${configDividerClass}"></div>`;

      const blockId = $collection.dataset.blockId,
        storedState = await db.get(['collections', blockId, menuItem.key], menuItem.default),
        $item = web.html`<div class="${configItemClass}-${menuItem.type}"></div>`;

      switch (menuItem.type) {
        case 'toggle':
          const $label = web.html`<div class="${configTitleClass}">${menuItem.name}</div>`,
            $toggle = web.html`<div class="${configToggleClass}"
              data-toggled="${storedState || false}"></div>`;
          web.render($item, $label, $toggle);
          $item.setAttribute('tabindex', 0);
          $item.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newState = !($toggle.dataset.toggled === 'true');
            $toggle.dataset.toggled = newState;
            await db.set(['collections', blockId, menuItem.key], newState);
            setTweakState($collection, menuItem.key, newState);
            if (menuItem.action) menuItem.action($collection, newState);
          });
          break;

        case 'input':
          const $input = web.html`<div class="${configInputClassName}">
            <input placeholder="${menuItem.name}" type="text"
              value="${web.escape(storedState) || ''}">
          </div>`;
          web.render($item, $input);
          $item.addEventListener('click', (e) => e.stopPropagation());
          if (menuItem.action) {
            $input.firstElementChild.addEventListener('input', async (e) => {
              e.stopPropagation();
              const newState = e.target.value;
              await db.set(['collections', blockId, menuItem.key], newState);
              menuItem.action($collection, newState);
            });
          }
          break;
      }
      return $item;
    },
    renderConfig = async ($collection, $button) => {
      if (document.querySelector(`.${overlayContainerClass}`)) return;

      const collectionViewType = getViewType($collection);
      if (!collectionViewType) return;

      const $overlay = web.html`<div class="${overlayContainerClass}"></div>`;
      $overlay.addEventListener('click', hideConfig);
      web.render(document.querySelector(notionAppSelector), $overlay);

      const $config = web.html`<div class="${configMenuClass}"></div>`,
        viewMenuItems = menuItems.filter(
          (item) =>
            (!item.views || item.views.includes(collectionViewType)) &&
            (!item.linkedOnly || isLinked($collection))
        ),
        $menuItemElements = await Promise.all(
          viewMenuItems.map((item) => renderConfigItem($collection, item))
        );
      web.render($config, ...$menuItemElements);
      const $firstMenuItem =
        $config.firstElementChild.getElementsByTagName('input')[0] ||
        $config.firstElementChild;

      const $position = web.html`
        <div style="position: fixed;">
          <div style="position: relative; pointer-events: auto;"></div>
        </div>
      `;
      $position.firstElementChild.appendChild($config);
      web.render($overlay, $position);

      const rect = $button.getBoundingClientRect();
      $position.style.left =
        Math.min(rect.left + rect.width / 2, window.innerWidth - ($config.offsetWidth + 14)) +
        'px';
      $position.style.top =
        Math.min(
          rect.top + rect.height / 2,
          window.innerHeight - ($config.offsetHeight + 14)
        ) + 'px';

      setTweakState($collection, 'config-open', true);
      for (const { keys, listener, opts } of keyListeners) {
        web.addHotkeyListener(keys, listener, opts);
      }
      await $config.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).finished;
      $firstMenuItem.focus();
    };
  async function hideConfig() {
    const $overlay = document.querySelector(`.${overlayContainerClass}`),
      $collection = document.querySelector(configOpenCollectionSelector);
    if (!$overlay) return;

    $overlay.removeEventListener('click', hideConfig);
    for (const { listener } of keyListeners) web.removeHotkeyListener(listener);

    await document
      .querySelector(`.${configMenuClass}`)
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).finished;
    setTweakState($collection, 'config-open', false);
    $overlay.remove();
  }

  const simplifyCollection = async () => {
    for (const $collection of document.querySelectorAll(collectionViewSelector)) {
      const blockId = $collection.dataset.blockId,
        $addNew = $collection.querySelector(collectionAddNewSelector);
      if ($collection.querySelector(`.${configButtonClass}`) || !$addNew) continue;

      const $configButton = $addNew.previousElementSibling.cloneNode();
      $configButton.className = configButtonClass;
      $configButton.innerHTML = configButtonSvg;
      $configButton.addEventListener('click', () => {
        renderConfig($collection, $configButton);
      });
      $addNew.parentElement.prepend($configButton);

      for (const item of menuItems) {
        if (item.key === 'divider') continue;
        const state = await db.get(['collections', blockId, item.key], item.default);
        if ((item.type !== 'input' && !item.linkedOnly) || isLinked($collection)) {
          setTweakState($collection, item.key, state);
        }
        if (state && item.action) item.action($collection, state);
      }
    }
  };
  web.addDocumentObserver(simplifyCollection, [collectionViewSelector]);
}
