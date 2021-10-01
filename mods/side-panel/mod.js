/*
 * side panel
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement, getEnhancements } = require('../../pkg/helpers.js'),
  path = require('path'),
  fs = require('fs-extra');

module.exports = {
  id: 'c8b1db83-ee37-45b4-bdb3-a7f3d36113db',
  tags: ['extension', 'panel'],
  name: 'side panel',
  desc: 'adds a side panel to notion.',
  version: '1.2.1',
  author: 'CloudHill',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      // load icons
      let icons = {};
      (async () => {
        icons.doubleChevron = await fs.readFile( path.resolve(__dirname, 'icons/double-chevron.svg') );
        icons.switcher = await fs.readFile( path.resolve(__dirname, 'icons/switcher.svg') );
        icons.reload = await fs.readFile( path.resolve(__dirname, 'icons/reload.svg') );
      })();

      // load panel mods
      let panelMods = 
        getEnhancements().loaded.filter(
          mod => (mod.panel && (store('mods')[mod.id] || {}).enabled)
        );
      // initialize panel values
      panelMods.forEach(mod => initMod(mod));
      
      // panelMods is an array containing objects with info about each panel

      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        // if no panel mods activated 
        if (panelMods.length < 1) return;
        
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          // default panel width
          if (!store().width) store().width = 220;
          let curPanel = {};
          
          if (!document.querySelector('.notion-sidebar')) return;
          clearInterval(attempt_interval);
          
          // notion elements to manipulate
          const frame = document.querySelector('.notion-frame');
          const notionSidebarContainer = document
            .querySelector(".notion-cursor-listener > div[style*=\"flex-end\"]");


          // INITIALIZE PANEL

          const container = createElement(
            '<div class="enhancer-panel--container"></div>'
          );
          const panel = createElement(
            `<div id="enhancer-panel"></div>`
          );
          container.appendChild(panel);
          
          // panel contents
          const header = createElement(`
            <div class="enhancer-panel--header">
              <div class="enhancer-panel--icon"></div>
              <div class="enhancer-panel--title"></div>
            </div>
          `);
          const content = createElement(
            '<div id="enhancer-panel--content"></div>'
          );
          const resize = createElement(`
            <div class="enhancer-panel--resize">
              <div style="cursor: col-resize;"></div>
            </div>
          `);
          panel.append(header, content, resize);

          // add switcher if there is more than one panel mods
          if (panelMods.length > 1) {
            const switcherIcon = createElement(
              `<div class="enhancer-panel--switcher-icon">${icons.switcher}</div>`
            )
            header.appendChild(switcherIcon);
            header.addEventListener('click', renderSwitcher);
          } else {
            header.addEventListener('click', togglePanel);
          } 

          // add panel lock toggle
          const toggle = createElement(
            `<div class="enhancer-panel--toggle">${icons.doubleChevron}</div>`
          );
          header.appendChild(toggle);
          toggle.addEventListener('click', togglePanel);

          // render panel
          notionSidebarContainer.after(container);

          // toggle panel keybind
          document.addEventListener('keyup', e => {
            const hotkey = {
              code: 'Backslash',
              ctrlKey: true,
              shiftKey: false,
              metaKey: false,
              altKey: true,
            };
            for (let prop in hotkey)
              if (hotkey[prop] !== e[prop]) return;
            togglePanel();
          });
          
          // Restore lock state
          if (store().locked === 'false') unlockPanel(false);
          else lockPanel();
          
          enableResize();

          // attempt to load last opened mod
          let loaded = false;
          if (store().last_open) {
            panelMods.forEach(mod => {
              if (mod.id === store().last_open) {
                loadPanelMod(mod);
                loaded = true;
              }
            });
          }
          if (!loaded) loadPanelMod(panelMods[0]);


          // loads a panel mod
          function loadPanelMod(mod) {
            // call previous panel's onSwitch function
            if (curPanel.js?.onSwitch) curPanel.js.onSwitch();
            
            // set current panel
            curPanel = mod.panel;
            store().last_open = mod.id;

            setPanelTitle(mod.panel.name);
            setPanelIcon(mod.panel.icon);
            setPanelContent(mod.panel.html);
            panel.dataset.fullHeight = mod.panel.fullHeight || false;

            // reload button
            let reloadButton = panel.querySelector('.enhancer-panel--reload-button');
            if (reloadButton) reloadButton.remove();
            if (mod.panel.reload) {
              reloadButton = createElement(
                `<div class="enhancer-panel--reload-button">${icons.reload}</div>`
              )
              reloadButton.addEventListener('click', e => { 
                e.stopPropagation();
                loadPanelMod(mod);
              })
              panel.querySelector('.enhancer-panel--title').after(reloadButton);
            }

            // execute panel's onLoad function
            if (curPanel.js?.onLoad) curPanel.js.onLoad();
          }

          function setPanelTitle(title) {
            panel.querySelector('.enhancer-panel--title').innerHTML = title;
          }

          function setPanelIcon(icon) {
            panel.querySelector('.enhancer-panel--icon').innerHTML = icon;
          }

          function setPanelContent(content) {
            document.getElementById('enhancer-panel--content').innerHTML = content;
          }

          function setPanelWidth(width) {
            // update width
            store().width = width;
            panel.style.width = width + 'px';

            if (isLocked()) {
              // panel container width
              container.style.width = width + 'px';
              // adjust notion elements to make space on the right
              frame.style.paddingRight =  width + 'px';
              notionSidebarContainer.style.right =  width + 'px';
            } else {
              // hide panel to the right of window
              panel.style.right = width + 'px';
            }
          }

          // LOCK/OPEN

          function lockPanel() {
            panel.dataset.locked = 'true';
            setPanelWidth(store().width);

            // anchor panel to right of window
            panel.style.right = 0;

            // remove handle
            const handle = panel.nextElementSibling;
            handle?.remove();

            // reset animation styles
            panel.style.opacity = '';
            panel.style.transform = '';
  
            // hover event listeners
            disableHideListener();

            // call panel's onLock function
            if (curPanel.js?.onLock) curPanel.js.onLock();
          }
  
          function unlockPanel(animate) {
            panel.dataset.locked = 'false';
            setPanelWidth(store().width);
            
            // hide panel container
            container.style.width = 0;
            // reset notion elements to full page
            frame.style.paddingRight = 0;
            notionSidebarContainer.style.right = 0;

            // add handle
            const handle = createElement(
              '<div class="enhancer-panel--hover-handle"></div>'
            )
            panel.after(handle);

            const addListeners = () => {
              // show panel when handle is hovered
              handle.addEventListener('mouseover', showPanel);
              handle.addEventListener('mousemove', showPanel);

              // hide panel when mouse leaves panel or handle
              enableHideListener();
              handle.addEventListener('mouseleave', e => {
                // don't hide if mouseover scrollbar or panel
                if (e.relatedTarget?.closest(".enhancer-panel--container") ||
                    e.relatedTarget?.classList.contains("notion-scroller")) return;
                hidePanel(e);
              });
            }

            // unlock animation
            if (animate) {
              panel.animate(
                [
                  { opacity: 1, transform: 'none' },
                  { opacity: 1, transform: 'translateY(60px)', offset: 0.4},
                  { opacity: 0, transform: `translateX(${store().width}px) translateY(60px)`},
                ], 
                { duration: 600, easing: 'ease-out' }
              ).onfinish = () => addListeners();
            } else addListeners();
            
            hidePanel();

            // call panel's onUnlock function
            if (curPanel.js?.onUnlock) curPanel.js.onUnlock();
          }
  
          function togglePanel(e) {
            if (e) e.stopPropagation();

            isLocked() ? unlockPanel(true) : lockPanel();
            
            store().locked = panel.dataset.locked;
          }
  
          function isLocked() {
            return panel.dataset.locked === 'true';
          }

          // WHEN UNLOCKED

          function showPanel(e) {
            if (isLocked()) return;
            if (e.shiftKey) {
              hidePanel();
              return;
            }

            panel.style.opacity = 1;
            panel.style.transform = 'translateY(60px)';
          }
  
          function hidePanel(e) {
            if (isLocked()) return;
            if (e?.type === 'mousemove' && !e.shiftKey) return;

            panel.style.opacity = 0;
            panel.style.transform = `translateX(${store().width}px) translateY(60px)`;
          }

          // panel hides when leaving panel body
          // mousemove listeners to hide when holding shift
          function enableHideListener() {
            panel.addEventListener('mousemove', hidePanel);
            panel.addEventListener('mouseleave', hidePanel);
          }
          function disableHideListener() {
            panel.addEventListener('mousemove', hidePanel);
            panel.removeEventListener('mouseleave', hidePanel);
          }

          // SWITCHER

          function renderSwitcher() {
            // switcher already rendered
            if (document.querySelector('.enhancer-panel--overlay-container')) return;

            // overlay to close switcher
            const overlayContainer = createElement(
              '<div class="enhancer-panel--overlay-container"></div>'
            );
            overlayContainer.addEventListener('click', hideSwitcher)
            document
              .querySelector('.notion-app-inner')
              .appendChild(overlayContainer);

            // position switcher below header
            const rect = panel.querySelector('.enhancer-panel--header').getBoundingClientRect();
            const div = createElement(`
              <div style="position: fixed; top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px ">
                <div style="position: relative; top: 100%; pointer-events: auto;"></div>
              </div>
            `);
            
            // initialize switcher
            const switcher = createElement(
              '<div class="enhancer-panel--switcher"></div>'
            );
            panelMods.forEach(mod => 
              switcher.append(renderSwitcherItem(mod))
            );
            
            div.firstElementChild.appendChild(switcher);
            overlayContainer.appendChild(div);

            // focus on first element
            switcher.firstElementChild.focus();

            // fade in
            switcher.animate(
              [ {opacity: 0}, {opacity: 1} ],
              { duration: 200 }
            );

            // prevent panel from closing if unlocked
            disableHideListener();

            // keyboard shortcuts
            document.addEventListener('keydown', switcherKeyEvent);
          }

          function hideSwitcher() {
            const overlayContainer = document
              .querySelector('.enhancer-panel--overlay-container');
            overlayContainer.removeEventListener('click', hideSwitcher);
            document.removeEventListener('keydown', switcherKeyEvent);
          
            // fade out
            document.querySelector('.enhancer-panel--switcher').animate(
              [ {opacity: 1}, {opacity: 0} ],
              { duration: 200 }
            ).onfinish = () => overlayContainer.remove();
            
            if (!isLocked()) enableHideListener();
          }

          function renderSwitcherItem(mod) {
            if (mod.panel) {
              const item = createElement(
                `<div class="enhancer-panel--switcher-item" tabindex="0">
                  <div class="enhancer-panel--icon">${mod.panel.icon}</div>
                  <div class="enhancer-panel--title">${mod.panel.name}</div>                
                </div>`
              );
              item.addEventListener('click', () => loadPanelMod(mod));
              return item;
            }
          }

          // handle switcher hotkeys
          function switcherKeyEvent(e) {
            e.stopPropagation();

            // esc -> hide switcher
            if (e.key === 'Escape') return hideSwitcher();
            
            // space/enter -> select panel
            const currentFocus = document.activeElement;
            if ([' ', 'Enter'].includes(e.key)) return currentFocus.click();
            
            // up/down/tab -> change focus
            if (e.key === 'ArrowUp') focusPrevious();
            else if (e.key === 'ArrowDown') focusNext();
            else if (e.key === 'Tab') {
              e.shiftKey ? focusPrevious() : focusNext();
              e.preventDefault();
            }
            
            function focusNext() {
              const nextEl = currentFocus.nextElementSibling;
              (nextEl || currentFocus.parentElement.firstElementChild).focus();
            }
            function focusPrevious() {
              const prevEl = currentFocus.previousElementSibling;
              (prevEl || currentFocus.parentElement.lastElementChild).focus();
            }
          }

          function enableResize() {
            const resizeHandle = panel.querySelector('.enhancer-panel--resize div');
            resizeHandle.addEventListener('mousedown', initDrag);

            let startX, startWidth;

            const overlay = createElement(
              '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 99;"></div>'
            );

            // mousedown
            function initDrag(e) {
              // initialize start position
              startX = e.clientX;
              startWidth = store().width;

              panel.appendChild(overlay);

              // set transitions
              container.style.transition = 'width 50ms ease-in';
              panel.style.transition = 'width 50ms ease-in, right 50ms ease-in';
              frame.style.transition = 'padding-right 50ms ease-in';
              notionSidebarContainer.style.transition = 'padding-right 50ms ease-in';

              resizeHandle.style.cursor = '';

              document.body.addEventListener('mousemove', drag);
              document.body.addEventListener('mouseup', stopDrag);
            }
            
            // mousemove
            function drag(e) {
              e.preventDefault();

              let width = startWidth + (startX - e.clientX);
              // minmax
              if (width < 190) width = 190;
              if (width > 480) width = 480;

              setPanelWidth(width);

              // prevent panel from closing if unlocked
              disableHideListener();

              // call panel's onResize function
              if (curPanel.js?.onResize) curPanel.js.onResize();
            }
            
            // mouseup
            function stopDrag() {
              resizeHandle.style.cursor = 'col-resize';
              panel.removeChild(overlay);

              // reset transitions
              container.style.transition = 
                panel.style.transition =
                frame.style.transition =
                notionSidebarContainer.style.transition = '';
              

              if (!isLocked()) enableHideListener();

              document.body.removeEventListener('mousemove', drag);
              document.body.removeEventListener('mouseup', stopDrag);
            }
          }
        }
      });


      // INITIALIZATION FUNCTIONS

      // set values for panel
      async function initMod(mod) {
        // load panel sites
        if (mod.id === '0d541743-eb2c-4d77-83a8-3b2f5e8e5dff') {
          panelMods = panelMods.filter(panelMod => panelMod !== mod);
          return panelMods.push(...initPanelSites(mod));
        }
        
        try {
          if (typeof mod.panel === 'object') {

            // html -> relative path to html file
            mod.panel.html = await fs.readFile(
              path.resolve(__dirname, `../${mod.dir}/${mod.panel.html}`)
            );

            // name
            mod.panel.name = mod.panel.name || mod.name;

            // icon
            if (mod.panel.icon) {
              const iconPath = path.resolve(__dirname, `../${mod.dir}/${mod.panel.icon}`);
              if (await fs.pathExists(iconPath))
                mod.panel.icon = await fs.readFile(iconPath);
            } else {
              mod.panel.icon = mod.panel.name[0];
            }

            // js -> relative path to js file
            if (mod.panel.js) {
              const jsPath = `../${mod.dir}/${mod.panel.js}`;
              if (await fs.pathExists(path.resolve(__dirname, jsPath))) {
                // execute js file
                mod.panel.js = require(jsPath)(loadStore(mod), __exports);
              }
            }
          } else if (typeof mod.panel === 'string') {

            // icon
            mod.panel.icon = mod.name[0];

            // mod.panel -> rel path to html file 
            mod.panel.html = await fs.readFile(
              path.resolve(__dirname, `../${mod.dir}/${mod.panel}`)
            );
          } else throw Error;
        } catch (err) {
          // remove mod from panel list
          console.log('invalid panel mod: ' + mod.name);
          panelMods = panelMods.filter(panelMod => panelMod !== mod);
        }
      }

      // returns an array of panels
      function initPanelSites(mod) {
        let panelSites = [];
        const sitesPath = store(mod.id).sites;
        if (sitesPath) {
          try {
            const sites = require(sitesPath);
            const invalid = false;
            // execute panel-sites/panel.js
            const sitePanelJs = require('../panel-sites/panel.js')(loadStore(mod), __exports);

            // returns site's iframe
            const frameUrl = (url, mobile) => {
              if (!/(^https?:\/\/)/i.test(url)) url = 'https://' + url;
              return `<iframe src=${url} class="panel-site" ${mobile ? 'mobile-user-agent' : ''}></iframe>`;
            }

            sites.forEach(site => {
              if (site.url && site.name) {
                
                // get iframe and icon
                const iframe = frameUrl(site.url, site.mobile);
                const icon = `<img style="width: 100%; height: 100%;" 
                    src="${site.icon || `https://www.google.com/s2/favicons?domain=${site.url}`}" />`;

                // add panel object to array
                const panelMod = {
                  id: `${mod.id}-${site.url}`,
                  panel: { 
                    name: site.name,
                    html: iframe,
                    icon: icon,
                    js: sitePanelJs,
                    fullHeight: true,
                    reload: true,
                  },
                }
                panelSites.push(panelMod);
              } else invalid = true; // continue initializing next sites
            });
            if (invalid) throw Error;
          }
          catch (err) {
            console.log('panel site error');
          }
        }
        return panelSites;
      }

      function loadStore(mod) {
        return (...args) => {
          if (!args.length) return store(mod.id, mod.defaults);
          if (args.length === 1 && typeof args[0] === 'object')
            return store(mod.id, { ...mod.defaults, ...args[0] });
          const other_mod = modules.find((m) => m.id === args[0]);
          return store(args[0], {
            ...(other_mod ? other_mod.defaults : {}),
            ...(args[1] || {})
          })
        }
      }
    },
  },
};
