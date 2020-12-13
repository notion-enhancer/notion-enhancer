/*
 * notion-icons
 * (c) 2020 jayhxmo (https://jaymo.io/)
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js'),
  fs = require('fs-extra'),
  path = require('path'),
  notionIconsUrl = 'https://raw.githubusercontent.com/notion-enhancer/icons/main/';

module.exports = {
  id: '2d1f4809-9581-40dd-9bf3-4239db406483',
  tags: ['extension'],
  name: 'notion icons',
  desc:
    'use custom icon sets directly in notion.',
  version: '1.2.0',
  author: 'jayhxmo',
  options: [
    {
      key: 'hide',
      label: 'hide icon sets by default.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'json',
      label: 'insert custom json',
      type: 'file',
      extensions: ['json'],
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      let garbageCollector = [],
        filterMap = new WeakMap();
        
      function getAsync(urlString, callback) {
        let httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function() {
          if (httpReq.readyState == 4 && httpReq.status == 200) callback(httpReq.responseText);
        };
        httpReq.open('GET', urlString, true);
        httpReq.send(null);
      }

      const menuIcons = {};
      (async () => {
        menuIcons.triangle = await fs.readFile( path.resolve(__dirname, 'icons/triangle.svg') );
        menuIcons.remove   = await fs.readFile( path.resolve(__dirname, 'icons/remove.svg'  ) );
        menuIcons.restore  = await fs.readFile( path.resolve(__dirname, 'icons/restore.svg' ) );
        menuIcons.search   = await fs.readFile( path.resolve(__dirname, 'icons/search.svg'  ) );
      })();

      // source => icon data
      const enhancerIconSets = new Map();
      getAsync(notionIconsUrl + 'icons.json', iconsData => {
        const data = JSON.parse(iconsData);
        (data.icons || data).forEach(set => {
          enhancerIconSets.set(set.source, set);
        })
      });

      // array
      let customIconSets;
      if (store().json) {
        const customData = JSON.parse(
          fs.readFileSync(store().json)
        )
        customIconSets = customData.icons || customData;
      }

      // notion icons overlay

      function addIconsTab() {
        // prevent icons tab duplication
        if (getTab(5))
          return removeIconsOverlay();
        
        // change 'Upload an image' to 'Upload'
        getTab(2, true).innerText = 'Upload';

        // initialize icons tab
        const iconsTab = getTab(3).cloneNode(true);
        iconsTab.className = 'notion-icons--tab';
        iconsTab.firstChild.innerText = 'Icons';
        iconsTab.firstChild.addEventListener('click', renderIconsOverlay);
        
        // insert icons tab
        const tabStrip = getTab(1).parentElement;
        tabStrip.insertBefore(iconsTab, tabStrip.lastChild);

        initCloseTriggers();
      }

      function renderIconsOverlay() {
        if (!isCurrentTab(4)) {
          // switch to 3rd tab so that the link can be input in the underlay
          if (!isCurrentTab(3)) getTab(3, true).click();

          if (
            store().removedSets?.length > 0 && 
            enhancerIconSets.size > 0
          )
            addRestoreButton();

          // set active bar on icons tab
          const iconsTab = getTab(4),
            activeBar = createElement(
              `<div id="notion-icons--active-bar"></div>`
            );
          iconsTab.style.position = 'relative';
          iconsTab.appendChild(activeBar);
          getTab(3).setAttribute('hide-active-bar', '');

          // create icons overlay
          const notionIcons = createElement(
            '<div id="notion-icons"></div>'
          );

          // render search bar
          const search = createElement(`
              <div class="notion-icons--search notion-focusable">
                ${menuIcons.search}
                <input placeholder="Filter…" type="text">
              </div>
            `),
            searchInput = search.lastElementChild;
          
          searchInput.addEventListener('input', () => {
            filterIcons(searchInput.value);
          });
          
          // render scroller and icon sets
          const scroller = createElement(`
            <div class="notion-icons--scroller"></div>
          `);
          scroller.appendChild( loadIconSets() );

          notionIcons.append(search, scroller);
          
          // insert icons overlay
          document.querySelector('.notion-media-menu > .notion-scroller')
            .appendChild(notionIcons);

          // focus on search bar
          requestAnimationFrame(() => {
            searchInput.focus();
          });
        }
      }

      // convert icons data into renderable
      function loadIconSets() {
        const iconSets = new DocumentFragment();

        if (customIconSets) {
          customIconSets.forEach(i => {
            iconSets.appendChild( renderIconSet(i) );
          });

          // divider
          iconSets.appendChild(
            createElement('<div class="notion-icons--divider"></div>')
          );
        }

        if (enhancerIconSets.size > 0) {
          enhancerIconSets.forEach((i, source) => {
            // ignore removed icon sets
            if ( store().removedSets?.includes(source) ) return;
  
            i.sourceUrl = i.sourceUrl || (notionIconsUrl + source);
            iconSets.appendChild( renderIconSet(i, true) );
          });
        }

        return iconSets;
      }

      // returns icon set element
      function renderIconSet(iconData, enhancerSet = false) {
        const iconSet = createElement(
          '<div class="notion-icons--icon-set"></div>'
        );

        try {
          const author = iconData.author 
            ? iconData.authorUrl
              ? ` by <a target="_blank" href="${iconData.authorUrl}">${iconData.author}</a>`
              : ` by <span>${iconData.author}</span>`
            : '';

          const toggle = createElement(`
            <div class="notion-icons--toggle">
              ${menuIcons.triangle}
              <div class="notion-icons--author">${iconData.name}${author}</div>
              <div class="notion-icons--actions">
                <div class="notion-icons--spinner">
                  <img src="/images/loading-spinner.4dc19970.svg" />
                </div>
              </div>
            </div>
          `);
        
          const iconSetBody = createElement(
            '<div class="notion-icons--body"></div>'
          );

          iconSet.append(toggle, iconSetBody);

          const promiseArray = [];
          // render icons
          for (let i = 0; i < (iconData.count || iconData.source.length); i++) {

            const iconUrl = iconData.sourceUrl
              ? Array.isArray(iconData.source)
                ? `${iconData.sourceUrl}/${iconData.source[i]}.${iconData.extension}`
                : `${iconData.sourceUrl}/${iconData.source}_${i}.${iconData.extension}`
              : iconData.source[i];

            const icon = createElement(`<div class="notion-icons--icon"></div>`);
            icon.innerHTML = enhancerSet
              // load sprite sheet
              ? `<div style="background-image: url(${notionIconsUrl}${iconData.source}/sprite.png); background-position: 0 -${i * 32}px;"></div>`
              : `<img src="${iconUrl}" />`;

            // add filters to filterMap
            const filters = [];

            if (iconData.filter) {
              if (iconData.filter === 'source') {
                const filename = iconUrl.match(/.*\/(.+?)\./);
                if (filename?.length > 1) {
                  filters.push(...filename[1].split(/[ \-_]/));
                }
              }
              else if (Array.isArray(iconData.filter)) {
                filters.push(...iconData.filter[i]);
              }
              icon.setAttribute('filter', filters.join(' '));
            }

            // add set name and author to filters
            filters.push(...iconData.name.toLowerCase().split(' '));
            if (iconData.author) filters.push(...iconData.author.toLowerCase().split(' '));

            filterMap.set(icon, filters);

            // make sure icons load
            if (!enhancerSet) {
              promiseArray.push(
                new Promise((resolve, reject) => {
                  icon.firstChild.onload = resolve;
                  icon.firstChild.onerror = () => {
                    reject();
                    icon.classList.add('error');
                    icon.innerHTML = '!';
                  };
                })
              );
            }

            garbageCollector.push(icon);
            icon.addEventListener('click', () => setPageIcon(iconUrl));
            iconSetBody.appendChild(icon);
          }
          
          // hide spinner after all icons finish loading
          (async () => {      
            const spinner = toggle.querySelector('.notion-icons--spinner'),
              loadPromise = Promise.all(promiseArray);
            loadPromise.then(
              () => spinner.remove(),
              () => {
                iconSet.classList.add('alert')
                spinner.remove();
              }
            );
          })();

          // add remove icon set button
          if (enhancerSet) {
            const removeButton = createElement(
              `<div class="notion-icons--remove-button">${menuIcons.remove}</div>`
            );
            removeButton.addEventListener('click', e => {
              e.stopPropagation();
              removeIconSet(iconData);
            });
            iconSet.querySelector('.notion-icons--actions')
              .appendChild(removeButton);
          }

          // set up toggle
          toggle.addEventListener('click', e => {
            if (e.target.nodeName === 'A') return;
            toggleIconSet(iconSet);
          });

          // hide by default?
          if (store().hide)
            requestAnimationFrame(() => toggleIconSet(iconSet))

          // tooltip
          let timeout;
          iconSetBody.addEventListener('mouseover', e => {
            const el = e.target;
            if (!el.hasAttribute('filter')) return;
            
            document.querySelector('.notion-icons--tooltip')?.remove();
            timeout = setTimeout(() => {
              renderTooltip(el, el.getAttribute('filter'))
            }, 300);
          })
          iconSetBody.addEventListener('mouseout', e => {
            const el = e.target;
            if (!el.hasAttribute('filter')) return;
            
            document.querySelector('.notion-icons--tooltip')?.remove();
            clearTimeout(timeout);
          });

        } catch (err) {
          iconSet.classList.add('error');
          iconSet.innerHTML = `Invalid Icon Set: ${iconData.name}`;
        }

        return iconSet;
      }

      function removeIconsOverlay() {
        const elements = [
          document.getElementById('notion-icons'),
          document.getElementById('notion-icons--active-bar'),
          document.querySelector('.notion-icons--restore-button'),
          document.querySelector('.notion-icons--tooltip'),
        ]
        elements.forEach(el => {
          if (el) el.remove();
        })

        getTab(4).style.position = '';

        if (getTab(3)) 
          getTab(3).removeAttribute('hide-active-bar');

        if (
          document.querySelector('.notion-icons--overlay-container')
        ) closeRestoreOverlay();

        if (garbageCollector.length) {
          for (let i = 0; i < garbageCollector.length; i++) {
            garbageCollector[i] = null;
          }
          garbageCollector = [];
        }
      }

      function initCloseTriggers() {
        // remove the icons overlay when clicking...
        const triggers = [
          // the fog layer
          document.querySelector('.notion-overlay-container [style*="width: 100vw; height: 100vh;"]'),
          // the first three buttons
          ...[1, 2, 3].map( n => getTab(n, true) ),
          // the remove button
          (getTab(5) || getTab(4)).lastElementChild,
        ];

        triggers.forEach(t => {
          t.addEventListener('click', removeIconsOverlay);
          garbageCollector.push(t);
        })
        
        // remove the icons overlay when pressing the Escape key
        document.querySelector('.notion-media-menu')
          .addEventListener('keydown', e => {
            if (e.keyCode === 27) removeIconsOverlay();
          });
      }

      // restore overlay
      
      function addRestoreButton() {
        const buttons = getTab(1).parentElement.lastElementChild;

        const restoreButton = buttons.lastElementChild.cloneNode(true);
        restoreButton.className = 'notion-icons--restore-button';
        restoreButton.innerHTML = menuIcons.restore;
        restoreButton.addEventListener('click', renderRestoreOverlay);
        
        buttons.prepend(restoreButton);
      }

      function renderRestoreOverlay() {
        if (!store().removedSets) return;
        store().removedSets.sort();

        const overlayContainer = createElement(`
          <div class="notion-icons--overlay-container"></div>
        `);
        overlayContainer.addEventListener('click', closeRestoreOverlay);
        document.querySelector('.notion-app-inner').appendChild(overlayContainer);

        const rect = document.querySelector('.notion-icons--restore-button')
          .getBoundingClientRect();
        const div = createElement(`
          <div style="position: fixed; top: ${rect.top}px; left: ${rect.left}px; height: ${rect.height}px;">
            <div style="position: relative; top: 100%; pointer-events: auto;"></div>
          </div>
        `);

        const restoreOverlay = createElement(`
          <div class="notion-icons--restore"></div>
        `)

        store().removedSets.forEach(source => {
          restoreOverlay.appendChild( renderRestoreItem(source) );
        })

        overlayContainer.appendChild(div);
        div.firstElementChild.appendChild(restoreOverlay);

        // fade in
        restoreOverlay.animate(
          [ {opacity: 0}, {opacity: 1} ],
          { duration: 200 }
        );
      }

      function renderRestoreItem(source) {
        const iconData = enhancerIconSets.get(source);
        const iconUrl = `
          ${iconData.sourceUrl || (notionIconsUrl + source)}/${source}_${0}.${iconData.extension}
        `;
        const restoreItem = createElement(`
          <div class="notion-icons--removed-set">
            <div style="flex-grow: 0; flex-shrink: 0; width: 32px; height: 32px;">
              <img style="width: 100%; height: 100%" src="${iconUrl}" />
            </div>
            <span style="margin: 0 8px;">${iconData.name}</span>
          </div>
        `)
        restoreItem.addEventListener('click', () => restoreIconSet(iconData));
        return restoreItem;
      }

      function closeRestoreOverlay() {
        const overlayContainer = document.querySelector('.notion-icons--overlay-container');
        overlayContainer.removeEventListener('click', closeRestoreOverlay);
        // fade out
        document.querySelector('.notion-icons--restore').animate(
          [ {opacity: 1}, {opacity: 0} ],
          { duration: 200 }
        ).onfinish = () => overlayContainer.remove();
      }

      // icon set actions

      function toggleIconSet(iconSet, hide) {
        const isHidden = iconSet.hasAttribute('hidden-set');
        if (hide == null) hide = !isHidden;

        const body = iconSet.lastChild;
        if (hide && !isHidden) {
          iconSet.setAttribute('hidden-set', '');
          body.style.height = body.offsetHeight + 'px';
          requestAnimationFrame(
            () => body.style.height = 0
          );
        }
        else if (!hide && isHidden) {
          iconSet.removeAttribute('hidden-set');
          // get height
          body.style.height = '';
          const height = body.offsetHeight;
          body.style.height = 0;

          requestAnimationFrame(
            () => body.style.height = height + 'px'
          );
          setTimeout(
            () => body.style.height = '', 200
          );
        }
      }

      function removeIconSet(iconData) {
        if (!store().removedSets) store().removedSets = [];
        if (!store().removedSets.includes(iconData.source))
          store().removedSets.push(iconData.source);
        removeIconsOverlay();
        renderIconsOverlay();
      }

      function restoreIconSet(iconData) {
        if (!store().removedSets) return;
        store().removedSets = store().removedSets
          .filter(source => source !== iconData.source);
        removeIconsOverlay();
        renderIconsOverlay();
      }

      // other actions

      // submit the icon's url as an image link
      function setPageIcon(iconUrl) {
        const input = document.querySelector('.notion-media-menu input[type=url]');

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(input, iconUrl);

        input.dispatchEvent(
          new Event('input', { bubbles: true })
        );

        input.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13 })
        );

        removeIconsOverlay();
      }

      function filterIcons(input) {
        const iconSets = document.querySelectorAll('.notion-icons--icon-set');
        if (!iconSets) return;

        // show all sets and icons
        if (!input) return iconSets.forEach(set => {
          set.style.display = '';
          set.querySelectorAll('.notion-icons--icon')
            .forEach(i => i.style.display = '');
        });
        // split input into an array
        else input = input.toLowerCase().trim().split(' ');

        const findMatch = icon => {
          const iconFilters = filterMap.get(icon).slice();

          // match whole words for the first terms
          if (input.length > 1) {
            let index;
            for (let i of input.slice(0, -1)) {
              if (
                ( index = iconFilters.indexOf(i) ) >= 0
              ) {
                iconFilters.splice(index, 1);
                continue;
              }
              return false;
            }
          }

          // match partially for the last term
          for (let iconFilter of iconFilters) {
            if (iconFilter.includes(input[input.length - 1])) {
              return true;
            };
          }

          return false;
        }

        iconSets.forEach(set => {
          let found = false;

          set.querySelectorAll('.notion-icons--icon')
            .forEach(i => {
              // hide icon set
              if (!filterMap.has(i)) return; 
    
              if (findMatch(i)) {
                i.style.display = '';
                found = true;
              } else i.style.display = 'none';
            });

          if (!found) set.style.display = 'none';
          else {
            set.style.display = '';
            toggleIconSet(set, false);
          }
        })
      }

      function renderTooltip(el, text) {
        const rect = el.getBoundingClientRect();
        const overlayContainer = document.querySelector('.notion-overlay-container')

        const tooltip = createElement(`
            <div class="notion-icons--tooltip" style="left: ${rect.left}px; top: ${rect.top}px;">
              <div></div>
            </div>
          `), tooltipText = createElement(
            `<div class="notion-icons--tooltip-text">${text}</div>`
          );

        tooltip.firstElementChild.appendChild(tooltipText);      
        overlayContainer.appendChild(tooltip);

        // prevent tooltip from rendering outside the window
        const left = (tooltipText.offsetWidth / 2) - (rect.width / 2) - rect.left + 4;
        if (left > 0) tooltipText.style.left = left + 'px';
      }

      document.addEventListener('readystatechange', () => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          const overlay = document.querySelector('.notion-overlay-container');
          if (!overlay) return;
          clearInterval(attempt_interval);

          const observer = new MutationObserver((list, observer) => {
            for ( let { addedNodes } of list) {
              if (
                addedNodes[0]?.querySelector?.('.notion-media-menu') &&
                /^pointer-events: auto; position: relative; z-index: \d;$/
                  .test(addedNodes[0].style.cssText)
              ) {
                addIconsTab();
              }
            }
          });
          observer.observe(overlay, {
            childList: true,
            subtree: true,
          });
        }
      });
    
      // helpers

      function getTab(n, button = false) {
        return document.querySelector(
          `.notion-media-menu > :first-child > :first-child > :nth-child(${n}) ${button ? 'div' : ''}`
        );
      } 

      function isCurrentTab(n) {
        return getTab(n).childNodes.length > 1;
      }
    },
  },
};
