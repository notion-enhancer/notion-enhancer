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
  version: '1.0.0',
  author: 'CloudHill',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      // Load icons
      let icons = {};
      (async () => {
        icons.doubleChevron = await fs.readFile( path.resolve(__dirname, 'icons/double-chevron.svg') );
        icons.switcher = await fs.readFile( path.resolve(__dirname, 'icons/switcher.svg') );
        icons.reload = await fs.readFile( path.resolve(__dirname, 'icons/reload.svg') );
      })();

      // Load panel mods
      let panelMods = getEnhancements().loaded.filter(mod => 
        (mod.panel && (store('mods')[mod.id] || {}).enabled)
      );
      
      // Get panel info
      panelMods.forEach(mod => initMod(mod));      
      async function initMod(mod) {
        try {
          if (typeof mod.panel === 'object') {
            // html
            mod.panel.html = await fs.readFile(
              path.resolve(__dirname, `../${mod.dir}/${mod.panel.html}`)
            );
            // name
            if (!mod.panel.name) mod.panel.name = mod.name;
            // icon
            if (mod.panel.icon) {
              const iconPath = path.resolve(__dirname, `../${mod.dir}/${mod.panel.icon}`);
              if (await fs.pathExists(iconPath))
                mod.panel.icon = await fs.readFile(iconPath);
            } else {
              mod.panel.icon = mod.panel.name[0];
            }
            // js
            if (mod.panel.js) {
              const jsPath = `../${mod.dir}/${mod.panel.js}`;
              if (await fs.pathExists(path.resolve(__dirname, jsPath)))
                mod.panel.js = require(jsPath)(store(mod.id));
            }
          } else if (typeof mod.panel === 'string') {
            mod.panel.icon = mod.name[0];
            mod.panel.html = await fs.readFile(
              path.resolve(__dirname, `../${mod.dir}/${mod.panel}`)
            );
          } else throw Error;
        } catch (err) {
          console.log('invalid panel mod: ' + mod.name);
          panelMods = panelMods.filter(panelMod => panelMod !== mod); 
        }
      }

      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        if (panelMods.length < 1) return;

        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          let curPanel = {};

          const frame = document.querySelector('.notion-frame');
          if (!frame) return;
          clearInterval(attempt_interval);

          // Initialize panel
          const container = createElement(
            '<div class="enhancer-panel--container"></div>'
          );
          const panel = createElement(
            `<div id="enhancer-panel"></div>`
          );
          
          frame.after(container);
          container.appendChild(panel);
          
          // Panel contents
          const header = createElement(`
            <div class="enhancer-panel--header">
              <div class="enhancer-panel--icon"></div>
              <div class="enhancer-panel--title"></div>
            </div>
          `);
          const toggle = createElement(
            `<div class="enhancer-panel--toggle">${icons.doubleChevron}</div>`
          );
          const content = createElement(
            '<div id="enhancer-panel--content"></div>'
          );
          const resize = createElement(`
            <div class="enhancer-panel--resize">
              <div style="cursor: col-resize;"></div>
            </div>
          `);

          panel.append(header, content, resize);

          // Add switcher if there is more than one panel mods
          if (panelMods.length > 1) {
            header.addEventListener('click', renderSwitcher);
            const switcherIcon = createElement(
              `<div class="enhancer-panel--switcher-icon">${icons.switcher}</div>`
            )
            header.appendChild(switcherIcon);
          } else {
            header.addEventListener('click', togglePanel);
          } 

          header.appendChild(toggle);
          toggle.addEventListener('click', togglePanel);

          // Keybind
          document.addEventListener('keyup', e => {
            const hotkey = {
              code: 'Backslash',
              ctrlKey: true,
              shiftKey: true,
              metaKey: false,
              altKey: false,
            };
            for (let prop in hotkey)
              if (hotkey[prop] !== e[prop]) return;
            togglePanel();
          });
          
          // Restore lock state
          if (store().locked === 'true') lockPanel();
          else unlockPanel(false);
          
          enableResize();

          // Attempt to load last opened mod
          let loaded = false;
          if (store().last_open) {
            panelMods.forEach(mod => {
              if (mod.id === store().last_open) {
                loadContent(mod);
                loaded = true;
              }
            })
          }
          if (!loaded) {
            loadContent(panelMods[0]);
          }

          function loadContent(mod) {
            if (curPanel.js && curPanel.js.onSwitch) curPanel.js.onSwitch();
            curPanel = mod.panel;

            store().last_open = mod.id;
            panel.querySelector('.enhancer-panel--title').innerHTML = mod.panel.name || mod.name;

            // Reload button
            let reloadButton = document.querySelector('.enhancer-panel--reload-button');
            if (reloadButton) reloadButton.remove();
            if (mod.panel.reload) {
              reloadButton = createElement(
                `<div class="enhancer-panel--reload-button">${icons.reload}</div>`
              )
              reloadButton.addEventListener('click', e => { 
                e.stopPropagation();
                loadContent(mod);
              })
              panel.querySelector('.enhancer-panel--title').after(reloadButton);
            }

            panel.querySelector('.enhancer-panel--icon').innerHTML = mod.panel.icon;
            document.getElementById('enhancer-panel--content').innerHTML = mod.panel.html;
            panel.dataset.fullHeight = mod.panel.fullHeight || false;

            if (curPanel.js && curPanel.js.onLoad)
              curPanel.js.onLoad();
          }

          function unlockPanel(animate) {
            panel.dataset.locked = 'false';
            setPanelWidth(store().width);

            if (animate) {
              panel.animate(
                [
                  { opacity: 1, transform: 'none' },
                  { opacity: 1, transform: 'translateY(60px)', offset: 0.4},
                  { opacity: 0, transform: `translateX(${store().width - 30}px) translateY(60px)`},
                ], 
                { duration: 600, easing: 'ease-out' }
              ).onfinish = () => {
                panel.addEventListener('mouseover', showPanel);
                panel.addEventListener('mouseleave', hidePanel);
              }
            } else {
              panel.addEventListener('mouseover', showPanel);
              panel.addEventListener('mouseleave', hidePanel);
            }
            
            hidePanel();

            if (curPanel.js && curPanel.js.onUnlock) {
              curPanel.js.onUnlock();
            }
          }
  
          function lockPanel() {
            panel.dataset.locked = 'true';
            setPanelWidth(store().width);

            // Reset animation styles
            panel.style.opacity = '';
            panel.style.transform = '';
  
            // Hover event listeners
            panel.removeEventListener('mouseover', showPanel);
            panel.removeEventListener('mouseleave', hidePanel);

            if (curPanel.js && curPanel.js.onLock) {
              curPanel.js.onLock();
            }
          }
  
          function togglePanel(e) {
            if (e) e.stopPropagation();
            if (isLocked()) unlockPanel(true);
            else lockPanel();
            store().locked = panel.dataset.locked;
          }
  
          function showPanel() {
            if (!isLocked()) {
              panel.style.opacity = 1;
              panel.style.transform = 'translateY(60px)';
            }
          }
  
          function hidePanel() {
            if (!isLocked()) {
              panel.style.opacity = 0;
              panel.style.transform = `translateX(${store().width - 30}px) translateY(60px)`;
            }
          }

          function renderSwitcherItem(mod) {
            if (mod.panel) {
              const item = createElement(
                `<div class="enhancer-panel--switcher-item">
                  <div class="enhancer-panel--icon">${mod.panel.icon}</div>
                  <div class="enhancer-panel--title">${mod.panel.name || mod.name}</div>                
                </div>`
              );
              item.addEventListener('click', () => loadContent(mod));
              return item;
            }
          }

          function renderSwitcher() {
            if (document.querySelector('.enhancer-panel--overlay-container')) return;

            // Layer to close switcher
            const overlayContainer = createElement(
              '<div class="enhancer-panel--overlay-container"></div>'
            );
            overlayContainer.addEventListener('click', hideSwitcher)
            document.querySelector('.notion-app-inner').appendChild(overlayContainer);

            // Position switcher below header
            const rect = header.getBoundingClientRect();
            const div = createElement(`
              <div style="position: fixed; top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px ">
                <div style="position: relative; top: 100%; pointer-events: auto;"></div>
              </div>
            `);
            
            // Render switcher
            const switcher = createElement(
              '<div class="enhancer-panel--switcher"></div>'
            );
            panelMods.forEach(mod => 
              switcher.append(renderSwitcherItem(mod))
            );

            overlayContainer.appendChild(div);
            div.firstElementChild.appendChild(switcher);

            // Fade in
            switcher.animate(
              [ {opacity: 0}, {opacity: 1} ],
              { duration: 200 }
            );

            // Prevent panel from closing if unlocked
            panel.removeEventListener('mouseleave', hidePanel);
          }

          function hideSwitcher() {
            const overlayContainer = document.querySelector('.enhancer-panel--overlay-container');
            overlayContainer.removeEventListener('click', hideSwitcher);

            // Fade out
            document.querySelector('.enhancer-panel--switcher').animate(
              [ {opacity: 1}, {opacity: 0} ],
              { duration: 200 }
            ).onfinish = () => overlayContainer.remove();
            
            if (!isLocked()) panel.addEventListener('mouseleave', hidePanel);
          }

          function setPanelWidth(width) {
            store().width = width;
            panel.style.width = width + 'px';

            if (isLocked()) {
              container.style.width = width + 'px';
              frame.style.paddingRight =  width + 'px';
              panel.style.right = 0;
            } else {
              container.style.width = 0;
              frame.style.paddingRight = 0;
              panel.style.right = width + 'px';
            }
          }

          function enableResize() {
            const handle = resize.firstElementChild;
            handle.addEventListener('mousedown', initDrag);

            let startX, startWidth;
            const div = createElement(
              '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 99;"></div>'
            );

            function initDrag(e) {
              startX = e.clientX;
              startWidth = store().width;

              panel.appendChild(div);

              // Set transitions
              container.style.transition = 'width 50ms ease-in';
              panel.style.transition = 'width 50ms ease-in, right 50ms ease-in';
              frame.style.transition = 'padding-right 50ms ease-in';

              handle.style.cursor = '';
              // Prevent panel from closing if unlocked
              panel.removeEventListener('mouseleave', hidePanel);

              document.body.addEventListener('mousemove', drag);
              document.body.addEventListener('mouseup', stopDrag);
            }
            
            function drag(e) {
              e.preventDefault();
              let width = startWidth + (startX - e.clientX);
              if (width < 190) width = 190;
              if (width > 480) width = 480;
              setPanelWidth(width);
              
              if (curPanel.js && curPanel.js.onResize) {
                curPanel.js.onResize();
              }
            }
            
            function stopDrag() {
              handle.style.cursor = 'col-resize';
              panel.removeChild(div);

              // Reset transitions
              container.style.transition = 
                panel.style.transition = 
                frame.style.transition = '';
              
              if (!isLocked()) panel.addEventListener('mouseleave', hidePanel);
              
              document.body.removeEventListener('mousemove', drag);
              document.body.removeEventListener('mouseup', stopDrag);
            }
          }

          function isLocked() {
            if (panel.dataset.locked === 'true') return true;
            else return false;
          }
        }
      });
    },
  },
};
