/*
 * notion-icons
 * (c) 2019 jayhxmo (https://jaymo.io/)
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js'),
  fs = require('fs-extra');

module.exports = {
  id: '2d1f4809-9581-40dd-9bf3-4239db406483',
  tags: ['extension'],
  name: 'notion icons',
  desc:
    'use custom icon sets directly in Notion.',
  version: '1.0.0',
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
      let garbageCollector = [];
      const iconsUrl = 'https://raw.githubusercontent.com/notion-enhancer/icons/main/';

      function getAsync(urlString, callback) {
        let httpReq = new XMLHttpRequest();
        httpReq.onreadystatechange = function() {
          if (httpReq.readyState == 4 && httpReq.status == 200) callback(httpReq.responseText);
        };
        httpReq.open('GET', urlString, true);
        httpReq.send(null);
      }

      // Retrieve Icons data
      let notionIconsData;
      getAsync(iconsUrl + 'icons.json', iconsData => {
        notionIconsData = JSON.parse(iconsData);
      });

      // Retrieve custom Icons data
      let customIconsData;
      if (store().json) {
        customIconsData = JSON.parse(
          fs.readFileSync(store().json)
        )
      }

      function getTab(n, button = false) {
        return document.querySelector(
          `.notion-media-menu > :first-child > :first-child > :nth-child(${n}) ${button ? 'div' : ''}`
        );
      } 

      function isCurrentTab(n) {
        return getTab(n).childNodes.length > 1;
      }

      // Submits the icon's url as an image link
      function setPageIcon(iconUrl) {
        const input = document.querySelector('input[type=url]');

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

        removeIcons();
      }

      function addIconsTab() {
        // Prevent Icons tab duplication
        if (getTab(5)) {
          removeIcons();
          return;
        }

        // Change 'Upload an image' to 'Upload'
        getTab(2, true).innerText = 'Upload';

        // Initialize Icons tab
        const iconsTab = getTab(3).cloneNode(true);
        iconsTab.className = 'notion-icons--tab'
        iconsTab.firstChild.innerText = 'Icons';
        iconsTab.firstChild.addEventListener('click', renderIconsOverlay);
        
        // Insert Icons tab
        const tabStrip = getTab(1).parentElement;
        tabStrip.insertBefore(iconsTab, tabStrip.lastChild);

        // Remove the Icons overlay when clicking...
        const closeTriggers = [
          // The fog layer
          document.querySelector('.notion-overlay-container [style*="width: 100vw; height: 100vh;"]'),
          // The first three buttons
          ...Array.from( Array(3), (e, i) => getTab(i + 1, true) ),
          // The remove button
          getTab(5).lastChild,
        ];

        closeTriggers.forEach(trigger => {
          trigger.addEventListener('click', removeIcons);
          garbageCollector.push(trigger);
        })
        
        // Remove the Icons overlay when pressing the Escape key
        document.querySelector('.notion-media-menu')
          .addEventListener('keydown', e => {
            if (e.keyCode === 27) removeIcons();
          });
      }

      function renderIconSet(iconData) {
        const iconSet = createElement(
          '<div class="notion-icons--icon-set"></div>'
        )

        try {

          const authorText = iconData.author 
          ? iconData.authorUrl
            ? ` by <a target="_blank" href="${iconData.authorUrl}" style="opacity: 0.6;">${iconData.author}</a>`
            : ` by <span style="opacity: 0.6;">${iconData.author}</span>`
          : '';

          const iconSetToggle = createElement(
            `<div class="notion-icons--toggle">
              <svg viewBox="0 0 100 100" class="triangle"><polygon points="5.9,88.2 50,11.8 94.1,88.2"></polygon></svg>
              <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${iconData.name}${authorText}</div>
              <div class="notion-icons--spinner" style="margin-left: auto; margin-right: 8px; width: 1.2em; height: 1.2em;">
                <img src="/images/loading-spinner.4dc19970.svg" />
              </div>
            </div>`
          );
        
          const iconSetBody = createElement(
            '<div class="notion-icons--body"></div>'
          );

          iconSet.append(iconSetToggle);
          iconSet.append(iconSetBody);

          const promiseArray = [];
          // Render Icons
          for (let i = 0; i < (iconData.count || iconData.source.length); i++) {

            const iconUrl = iconData.sourceUrl
            ? Array.isArray(iconData.source)
              ? `${iconData.sourceUrl}/${iconData.source[i]}.${iconData.extension}`
              : `${iconData.sourceUrl}/${iconData.source}_${i}.${iconData.extension}`
            : iconData.source[i];

            const icon = createElement(`<div class="notion-icons--icon"></div>`);
            if (iconData.enhancerIcons) {
              // Load sprite sheet
              icon.innerHTML = 
                `<div style="width: 32px; height: 32px; background: url(${iconsUrl}${iconData.source}/sprite.png) 0 -${i * 32}px no-repeat; background-size: 32px;"></div>`;
            } else {
              icon.innerHTML = `<img src="${iconUrl}" />`;
              // Make sure icons load
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

            iconSetBody.append(icon);
            garbageCollector.push(icon);
            icon.addEventListener('click', () => setPageIcon(iconUrl));
          }
          
          // Hide spinner after all icons finish loading
          (async () => {      
            const spinner = iconSetToggle.querySelector('.notion-icons--spinner'),
              loadPromise = Promise.all(promiseArray);
            loadPromise.then(
              () => spinner.remove(),
              () => {
                iconSet.classList.add('alert')
                spinner.remove();
              }
            )
          })();

          // Set up Toggle
          requestAnimationFrame(() => {
            iconSetBody.style.height = iconSetBody.style.maxHeight = `${iconSetBody.offsetHeight}px`;
            if (store().hide) iconSetToggle.click();
          });
          
          iconSetToggle.addEventListener('click', e => {
            if (e.target.nodeName === 'A') return;
            iconSet.classList.toggle('hidden-set')
            iconSetBody.style.height = iconSet.classList.contains('hidden-set')
              ? 0
              : iconSetBody.style.maxHeight;
          });
    
        } catch (err) {
          iconSet.classList.add('error');
          iconSet.innerHTML = `Invalid Icon Set: ${iconData.name}`;
        }

        return iconSet;
      }

      function renderIconsOverlay() {
        if (!isCurrentTab(4)) {
          // Switch to 3rd tab so that the link can be inputed in the underlay
          if (!isCurrentTab(3)) getTab(3, true).click();

          // Set active bar on Icons Tab
          const iconsTab = getTab(4);
          const activeBar = createElement(
            `<div id="notion-icons--active-bar"></div>`
          )
          activeBar.style = 'border-bottom: 2px solid var(--theme--text); position: absolute; bottom: -1px; left: 8px; right: 8px;';
          iconsTab.append(activeBar);
          getTab(4).style.position = 'relative';
          getTab(3).className = 'hide-active-bar';

          // Convert Icons data into renderable 
          const iconSets = [];          

          if (customIconsData && customIconsData.icons) {
            customIconsData.icons.forEach(i => {
              iconSets.push( renderIconSet(i) );
            });

            // Divider
            iconSets.push(
              createElement(
                '<div style="height: 1px; margin-bottom: 9px; border-bottom: 1px solid var(--theme--table-border);"></div>'
              )
            )
          }

          if (notionIconsData && notionIconsData.icons) {
            notionIconsData.icons.forEach(i => {
              i.sourceUrl = i.sourceUrl || (iconsUrl + i.source);
              i.enhancerIcons = true;
              iconSets.push( renderIconSet(i) );
            });
          }

          // Create Icons overlay
          const notionIcons = createElement(
            '<div id="notion-icons"></div>'
          );
          iconSets.forEach( set => notionIcons.append(set) );
          
          // Insert Icons overlay
          document.querySelector('.notion-media-menu > .notion-scroller')
            .append(notionIcons);
        }
      }

      function removeIcons() {
        const notionIcons = document.getElementById('notion-icons'),
          activeBar = document.getElementById('notion-icons--active-bar');

        if (notionIcons)
          notionIcons.remove();

        if (activeBar) {
          activeBar.remove();
          getTab(4).style.position = '';
        }
        if (getTab(3)) getTab(3).className = '';

        if (garbageCollector.length) {
          for (let i = 0; i < garbageCollector.length; i++) {
            garbageCollector[i] = null;
          }
          garbageCollector = [];
        }
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
                addedNodes[0] &&
                addedNodes[0].style &&
                document.querySelector('.notion-media-menu')
              ) {
                for (let i = 0; i <= 3; i++) {
                  if (addedNodes[0].style.cssText === `pointer-events: auto; position: relative; z-index: ${i};`) {
                    addIconsTab();
                    return;
                  }
                }
              }
            }
          });
          observer.observe(overlay, {
            childList: true,
            subtree: true,
          });
        }
      });
    },
  },
};
