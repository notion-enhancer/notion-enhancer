/*
 * simpler databases
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: '752933b5-1258-44e3-b49a-61b4885f8bda',
  tags: ['extension'],
  name: 'simpler databases',
  desc: 'adds a menu to inline databases to toggle ui elements.',
  version: '1.0.0',
  author: 'CloudHill',
  hacks: {
    'renderer/preload.js'(store, __exports) {
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
          action: toggle,
        },
        {
          key: 'link',
          name: 'Link arrow',
          type: 'toggle',
          default: true,
          linkedOnly: true,
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
      ]
      
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        
        // observe for new or moved collection blocks
        const contentObserver = new MutationObserver((list, observer) => {
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              addedNodes[0].querySelector &&
              addedNodes[0].querySelector('.notion-collection_view-block')
            )
              findInlineCollections();  
          }
        });

        // observe for page changes 
        let queue = [];
        const pageObserver = new MutationObserver((list, observer) => {
          if (!queue.length) requestAnimationFrame(() => process(queue));
          queue.push(...list);
        });
        pageObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
        function process(list) {
          queue = [];
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              addedNodes[0].className === 'notion-page-content'
            ) {
              findInlineCollections();
              contentObserver.disconnect();
              contentObserver.observe(addedNodes[0],
                {
                  childList: true,
                  subtree: true,
                }
              );
            }
          }
        }
      });

      function findInlineCollections() {
        const collections = document.querySelectorAll('.notion-collection_view-block[style*="width"][style*="max-width"]');
        collections.forEach(collection => {
          if (collection.querySelector('.simpler-databases--config-button')) return;

          const blockId = collection.dataset.blockId;
          
          // config button
          const add = collection.querySelector('.notion-collection-view-item-add');
          if (!add) return;

          const configButton = add.previousElementSibling.cloneNode();
          configButton.className = 'simpler-databases--config-button';
          configButton.innerHTML = `<svg viewBox="0 0 14 14"><path d="M14,7.77 L14,6.17 L12.06,5.53 L11.61,4.44 L12.49,2.6 L11.36,1.47 L9.55,2.38 L8.46,1.93 L7.77,0.01 L6.17,0.01 L5.54,1.95 L4.43,2.4 L2.59,1.52 L1.46,2.65 L2.37,4.46 L1.92,5.55 L0,6.23 L0,7.82 L1.94,8.46 L2.39,9.55 L1.51,11.39 L2.64,12.52 L4.45,11.61 L5.54,12.06 L6.23,13.98 L7.82,13.98 L8.45,12.04 L9.56,11.59 L11.4,12.47 L12.53,11.34 L11.61,9.53 L12.08,8.44 L14,7.75 L14,7.77 Z M7,10 C5.34,10 4,8.66 4,7 C4,5.34 5.34,4 7,4 C8.66,4 10,5.34 10,7 C10,8.66 8.66,10 7,10 Z" /></svg>`;
          configButton.collectionBlock = collection;
          configButton.addEventListener('click', renderConfig);

          add.parentElement.prepend(configButton);

          // initialize store variable
          if (!store().blocks[blockId]) store().blocks[blockId] = {};

          // restore stored states
          menuItems.forEach(
            item => {
              if (item.key === 'divider') return;

              let storedValue = store().blocks[blockId][item.key];
              if (storedValue == null) // set defaults
                storedValue = store().blocks[blockId][item.key] = item.default;
              
              if (item.action) item.action(storedValue, collection);
              if (
                item.type !== 'input' &&
                !item.linkedOnly || isLinked(collection)
              ) {
                toggleDataTweaks(collection, item.key, storedValue);
              }
            }
          );
        });
      }

      // config

      function renderConfig(e) {
        if (document.querySelector('.simpler-databases--overlay-container')) return;
        const button = e.currentTarget;

        const collection = button.collectionBlock;
        if (!collection) return;

        const collectionView = getView(collection);
        if (!collectionView) return;

        // layer to close config
        const overlayContainer = createElement(
          '<div class="simpler-databases--overlay-container"></div>'
        );
        overlayContainer.addEventListener('click', hideConfig)
        document
          .querySelector('.notion-app-inner')
          .appendChild(overlayContainer);

        const div = createElement(`
          <div style="position: fixed;">
            <div style="position: relative; pointer-events: auto;"></div>
          </div>
        `);

        // render config
        
        toggleDataTweaks(collection, 'config-open', true);

        const config = createElement(
          '<div class="simpler-databases--config-menu"></div>'
        );

        // get menu items relevant to current view
        const viewMenu = menuItems.filter(
          item => (!item.views || item.views.includes(collectionView)) &&
            (!item.linkedOnly || isLinked(collection))
        );
        config.append(...viewMenu.map(
          item => renderConfigItem(item, collection)
        ));

        overlayContainer.appendChild(div);
        div.firstElementChild.appendChild(config);

        focusConfigItem(config.firstElementChild);
        
        // config positioning
        const rect = button.getBoundingClientRect();

        div.style.left = Math.min(
            rect.left + rect.width / 2, 
            window.innerWidth - (config.offsetWidth + 14)
          ) + 'px';

        div.style.top = Math.min(
            rect.top  + rect.height / 2,
            window.innerHeight - (config.offsetHeight + 14)
          ) + 'px';

        // fade in
        config.animate(
          [ {opacity: 0}, {opacity: 1} ],
          { duration: 200 }
        );

        // key bindings
        document.addEventListener('keydown', configKeyEvent);
      }

      function hideConfig() {
        const overlayContainer = document.querySelector('.simpler-databases--overlay-container');
        if (!overlayContainer) return;
        
        overlayContainer.removeEventListener('click', hideConfig);
        document.removeEventListener('keydown', configKeyEvent);

        toggleDataTweaks(
          document.querySelector('[data-tweaks*="config-open"]'), 
          'config-open', false
        );

        // fade out
        document.querySelector('.simpler-databases--config-menu').animate(
          [ {opacity: 1}, {opacity: 0} ],
          { duration: 200 }
        ).onfinish = () => overlayContainer.remove();
      }

      function renderConfigItem(menuItem, collection) {
        if (menuItem.key === 'divider')
          return createElement('<div class="simpler-databases--config-divider"></div');

        const blockId = collection.dataset.blockId;
        const item = createElement(`
          <div class="simpler-databases--config-item-${menuItem.type}">
          </div>
        `);

        const storedValue = store().blocks[blockId][menuItem.key];
        switch (menuItem.type) {
          case 'toggle':
            const toggleLabel = createElement(`
              <div class="simpler-databases--config-title">${menuItem.name}</div>
            `)
            const toggle = createElement(`
              <div class="simpler-databases--config-toggle"
                data-toggled="${storedValue || false}">
              </div>
            `);
            item.append(toggleLabel, toggle)
            item.setAttribute('tabindex', 0);

            item.addEventListener('click', e => {
              e.stopPropagation();
              
              const newState = !(toggle.dataset.toggled === 'true');
              toggle.dataset.toggled = newState;


              store().blocks[blockId][menuItem.key] = newState;
              toggleDataTweaks(collection, menuItem.key, newState);
              if (menuItem.action) menuItem.action(newState, collection);
            });
            break;

          case 'input':
            const input = createElement(`
              <div class="simpler-databases--config-input notion-focusable">
                <input placeholder="${menuItem.name}" 
                  type="text" value="${storedValue || ''}">
              </div>
            `);
            item.appendChild(input)
            item.addEventListener('click', e => e.stopPropagation());
            if (menuItem.action) {
              input.firstElementChild.addEventListener('input', e => {
                e.stopPropagation();
                const newValue = e.target.value;

                store().blocks[blockId][menuItem.key] = newValue;
                menuItem.action(newValue, collection);
              });
            }
            break;
        }          
        return item;
      }

      function focusConfigItem(item) {
        (
          item.getElementsByTagName('input')[0] || item
        ).focus();
      }
      
      function configKeyEvent(e) { 
        e.stopPropagation();

        if (e.key === 'Escape') return hideConfig();
        
        let currentFocus = document.activeElement
          .closest('[class^="simpler-databases--config-item"]');

        const parentEl = currentFocus.parentElement;
        if (
          [' ', 'Enter'].includes(e.key)
        ) return currentFocus.click();

        const focusNext = () => {
          let nextEl = currentFocus.nextElementSibling;
          if (nextEl) {
            if (nextEl.className.includes('divider'))
              nextEl = nextEl.nextElementSibling;
            focusConfigItem(nextEl);
          }
          else focusConfigItem(parentEl.firstElementChild);
        }
        const focusPrevious = () => {
          let prevEl = currentFocus.previousElementSibling;
          if (prevEl) {
            if (prevEl.className.includes('divider'))
              prevEl = prevEl.previousElementSibling;
            
            if (prevEl.className.includes('input'))
              prevEl.getElementsByTagName('input')[0].focus();
            focusConfigItem(prevEl);
          }
          else focusConfigItem(parentEl.lastElementChild);
        }
        
        if (e.key === 'ArrowUp') focusPrevious();
        else if (e.key === 'ArrowDown') focusNext();
        else if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (currentFocus === parentEl.firstElementChild) {
              focusConfigItem(parentEl.lastElementChild);
              e.preventDefault();
            }
          }
          else if (currentFocus === parentEl.lastElementChild) {
            focusConfigItem(parentEl.firstElementChild);
            e.preventDefault();
          }
        }
      }

      // get collection info

      function isLinked(collection) {
        return collection.querySelector('[style*=" height: 42px;"] .alias');
      }

      function getView(collection) {
        return collection.querySelector('.notion-scroller [class$="view"]')
          .className.split('-')[1]
      }

      // add/remove keys to data-tweaks
      function toggleDataTweaks(collection, key, state) {
        if (!collection.dataset.tweaks) collection.dataset.tweaks = '';
        
        const isActive = collection.dataset.tweaks.includes(`[${key}]`);
        if (state == null) state = !isActive;

        if (state && !isActive) {
          collection.dataset.tweaks += `[${key}]`;
        } else if (!state && isActive) {
          collection.dataset.tweaks = collection.dataset.tweaks
            .replace(`[${key}]`, '');
        }
      }

      // menu actions

      // replace and add observer to linked database titles
      function replaceTitle(value, collection) {
        const titleDiv = collection.querySelector('[style*="height: 42px;"] a [placeholder]');
        if (!titleDiv) return;
        if (!titleDiv.originalTitle && value) titleDiv.originalTitle = titleDiv.innerText;

        if (!titleDiv.titleObserver) {
          if (!value) return;
          // store reference to observer to disconnect() in future calls
          titleDiv.titleObserver = new MutationObserver(() => {
            const title = store().blocks[collection.dataset.blockId]['replace_title'];
            if (title && titleDiv.innerText !== title) titleDiv.innerText = title;
          });
        } else {
          titleDiv.titleObserver.disconnect();
        }
        
        if (value) { // observe
          titleDiv.innerText = value
          titleDiv.titleObserver.observe(titleDiv, {characterData: true, childList: true})
        } else { // reset
          titleDiv.titleObserver.disconnect();
          titleDiv.innerText = titleDiv.originalTitle;
          delete titleDiv.originalTitle;
        }
      }

      // show or hide toggle
      function toggle(state, collection) {
        const header = collection.querySelector('[style*=" height: 42px"]');
        if (!header) return;

        // define functions
        const collectionView = collection.querySelector('.notion-scroller');
        const hideCollection = () => {
          collectionView.style.height = collectionView.offsetHeight + 'px';
          requestAnimationFrame(() => {
            collection.dataset.toggledHidden = true;
            setTimeout(() => collectionView.dataset.hideItems = 'true', 200); // hide drag handles
          });
        }
        const showCollection = () => {
          // get height
          collection.dataset.toggledHidden = false;
          collectionView.style.height = '';
          collectionView.style.height = collectionView.offsetHeight + 'px';
          collection.dataset.toggledHidden = true;
          
          delete collectionView.dataset.hideItems;
          requestAnimationFrame(() =>{
            collection.dataset.toggledHidden = false;
            setTimeout(() => collectionView.style.height = '', 200);
          });
        }

        // restore previous state
        if (!collection.dataset.toggledHidden) {
          const storedState = store().blocks[collection.dataset.blockId].toggledHidden || false;
          if (storedState) hideCollection();
        }

        let toggle = header.querySelector('.simpler-databases--toggle');
        if (toggle) {
          // return if toggle is already there
          if (!state) toggle.remove(); 
          return;
        } else if (state) {
          // add toggle
          toggle = createElement(`
            <div class="simpler-databases--toggle">
              <svg viewBox="0 0 100 100" class="triangle">
                <polygon points="5.9,88.2 50,11.8 94.1,88.2" />
              </svg>
            </div>
          `);
          toggle.addEventListener('click', () => {
            const hide = !(collection.dataset.toggledHidden === 'true');
            store().blocks[collection.dataset.blockId].toggledHidden = hide;
            if (hide) hideCollection();
            else showCollection();
          });
          header.prepend(toggle);
        }
      }
    },
  },
};
