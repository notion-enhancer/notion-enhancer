/*
 * collapsible headers
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: '548fe2d7-174a-44dd-88d8-35c7f9a093a7',
  tags: ['extension'],
  name: 'collapsible headers',
  desc: 'adds toggles to collapse header sections.',
  version: '1.0.0',
  author: 'CloudHill',
  options: [
    {
      key: 'toggle',
      label: 'toggle position',
      type: 'select',
      value: ['left', 'right', 'inline'],
    },
    {
      key: 'animate',
      label: 'enable animation',
      type: 'toggle',
      value: true,
    },
    {
      key: 'divBreak',
      label: 'use divider blocks to break header sections',
      type: 'toggle',
      value: false,
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          if (!document.querySelector('.notion-frame')) return;
          clearInterval(attempt_interval);

          if (!store().collapsed_ids) store().collapsed_ids = [];
          
          window.addEventListener('hashchange', showSelectedHeader);

          // add toggles to headers whenever blocks are added/removed
          const contentObserver = new MutationObserver((list, observer) => {
            list.forEach(m => {
              let node = m.addedNodes[0] || m.removedNodes[0];
              if (
                (
                  node?.nodeType === Node.ELEMENT_NODE &&
                  (
                    node.className !== 'notion-selectable-halo' &&
                    !node.style.cssText.includes('z-index: 88;')
                  )
                ) && 
                (
                  m.target.className === 'notion-page-content' ||
                  m.target.className.includes('notion-selectable')
                )
              ) {
                // if a collapsed header is removed
                if (
                  node.dataset?.collapsed === 'true' &&
                  !node.nextElementSibling
                ) showHeaderContent(node);

                initHeaderToggles();
              }
            })
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
                showSelectedHeader();
                initHeaderToggles();
                contentObserver.disconnect();
                contentObserver.observe(addedNodes[0], {
                  childList: true,
                  subtree: true,
                });
              }
            }
          }

          // bind to ctrl + enter
          document.addEventListener('keyup', e => {
            const hotkey = {
              key: 'Enter',
              ctrlKey: true,
              metaKey: false,
              altKey: false,
              shiftKey: false,
            };
            for (let prop in hotkey)
              if (hotkey[prop] !== e[prop]) return;
            // toggle active/selected headers
            const active = document.activeElement;
            let toggle;
            if (
              (toggle = active.nextElementSibling || active.previousElementSibling)  && 
              toggle.className === 'collapse-header'
            ) {
              toggle.click();
            } else {
              toggleHeaders( getSelectedHeaders() );
            }
          });

          function initHeaderToggles() {
            const headerBlocks = document
              .querySelectorAll('.notion-page-content [class*="header-block"]');

            headerBlocks.forEach(header => {
              const nextBlock = header.nextElementSibling;

              // if header is moved
              if (
                header.dataset.collapsed && 
                header.collapsedBlocks &&
                header.collapsedBlocks[0] !== nextBlock   
              ) {
                showHeaderContent(header);
              }

              // if header has no content
              if (
                !nextBlock ||
                getHeaderLevel(nextBlock) <= getHeaderLevel(header) ||
                (
                  store().divBreak &&
                  nextBlock.classList &&
                  nextBlock.classList.contains('notion-divider-block')
                )
              ) {
                if (header.dataset.collapsed) {
                  delete header.dataset.collapsed;
                  const toggle = header.querySelector('.collapse-header');
                  if (toggle) toggle.remove();
                }
                return;
              };

              // if header already has a toggle
              if (header.querySelector('.collapse-header')) return;

              // add toggle to headers
              const toggle = createElement(`
                <div class="collapse-header">
                  <svg viewBox="0 0 100 100" class="triangle">
                    <polygon points="5.9,88.2 50,11.8 94.1,88.2" />
                  </svg>
                </div>
              `)

              if (store().toggle === 'left') header.firstChild.prepend(toggle);
              else header.firstChild.appendChild(toggle);

              if (store().toggle === 'inline')
                header.firstChild.setAttribute('inline-toggle', '');

              toggle.header = header;
              toggle.addEventListener('click', toggleHeaderContent);

              // check store for header
              header.dataset.collapsed = false;
              if (store().collapsed_ids.includes(header.dataset.blockId))
                collapseHeaderContent(header, false);
            });
          }

          function toggleHeaderContent(e) {
            e.stopPropagation();
            const toggle = e.currentTarget;
            const header = toggle.header;

            const selected = getSelectedHeaders();
            if (selected && selected.includes(header)) return toggleHeaders(selected);

            if (header.dataset.collapsed === 'true') showHeaderContent(header);
            else collapseHeaderContent(header);
          }

          function collapseHeaderContent(header, animate = true) {
            if (
              !header.className.includes('header-block') ||
              header.dataset.collapsed === 'true'
            ) return;
            header.dataset.collapsed = true;

            // store collapsed headers
            if (!store().collapsed_ids.includes(header.dataset.blockId)) {
              store().collapsed_ids.push(header.dataset.blockId);
            }

            const headerLevel = getHeaderLevel(header);
            const toggle = header.querySelector('.collapse-header');

            header.collapsedBlocks = getHeaderContent(header);
            header.collapsedBlocks.forEach(block => {
              // don't collapse already collapsed blocks
              if (block.hasAttribute('collapsed')) {
                if (+(block.getAttribute('collapsed')) < headerLevel) {
                  block.setAttribute('collapsed', headerLevel);
                  if (block.storeAttributes) block.storeAttributes.header = header;
                }
                return;
              };

              block.storeAttributes = {
                marginTop: block.style.marginTop,
                marginBottom: block.style.marginBottom,
                header: header,
              }
              block.style.marginTop = 0;
              block.style.marginBottom = 0;
              
              if (!store().animate) {
                block.setAttribute('collapsed', headerLevel);
                toggleInnerBlocks(block, true);
              } else {
                const height = block.offsetHeight;
                block.storeAttributes.height = height + 'px';
                block.setAttribute('collapsed', headerLevel);
                
                if (!animate) toggleInnerBlocks(block, true);
                else {
                  if (toggle) toggle.removeEventListener('click', toggleHeaderContent);
                  block.animate(
                    [
                      { 
                        maxHeight: height + 'px',
                        opacity: 1,
                        marginTop: block.storeAttributes.marginTop, 
                        marginBottom: block.storeAttributes.marginBottom, 
                      },
                      { 
                        maxHeight: (height - 100 > 0 ? height - 100 : 0) + 'px', 
                        opacity: 0, marginTop: 0, marginBottom: 0,
                      },
                      {
                        maxHeight: 0, opacity: 0, marginTop: 0, marginBottom: 0,
                      }
                    ], 
                    {
                      duration: 300,
                      easing: 'ease-out'
                    }
                  ).onfinish = () => {
                    if (toggle) toggle.addEventListener('click', toggleHeaderContent);
                    toggleInnerBlocks(block, true);
                  };
                }
              }
            });
          }

          function showHeaderContent(header, animate = true) {
            if (
              !header.className.includes('header-block') ||
              header.dataset.collapsed === 'false'
            ) return;
            header.dataset.collapsed = false;

            // remove header from store
            const collapsed_ids = store().collapsed_ids;
            if (collapsed_ids.includes(header.dataset.blockId)) {
              store().collapsed_ids = collapsed_ids.filter(id => id !== header.dataset.blockId);
            }

            if (!header.collapsedBlocks) return;
            const toggle = header.querySelector('.collapse-header');

            showBlockHeader(header);

            header.collapsedBlocks.forEach(block => {
              // don't toggle blocks collapsed under other headers
              if (
                +(block.getAttribute('collapsed')) > getHeaderLevel(header) ||
                !block.storeAttributes
              ) return;

              block.style.marginTop = block.storeAttributes.marginTop;
              block.style.marginBottom = block.storeAttributes.marginBottom;

              if (!store().animate) {
                block.removeAttribute('collapsed');
                toggleInnerBlocks(block, false);

              } else if (block.storeAttributes) {
                toggleInnerBlocks(block, false);

                if (!animate) block.removeAttribute('collapsed');
                else {
                  const height = parseInt(block.storeAttributes.height);
                  if (toggle) toggle.removeEventListener('click', toggleHeaderContent);
                  block.animate(
                    [
                      {
                        maxHeight: 0, opacity: 0, marginTop: 0, marginBottom: 0,
                      },
                      {
                        maxHeight: (height - 100 > 0 ? height - 100 : 0) + 'px',
                        opacity: 1,
                        marginTop: block.storeAttributes.marginTop,
                        marginBottom: block.storeAttributes.marginBottom, 
                      },
                      { 
                        maxHeight: height + 'px',
                        opacity: 1,
                        marginTop: block.storeAttributes.marginTop,
                        marginBottom: block.storeAttributes.marginBottom, 
                      }
                    ],
                    {
                      duration: 300,
                      easing: 'ease-out'
                    }
                  ).onfinish = () => {
                    if (toggle) toggle.addEventListener('click', toggleHeaderContent);
                    block.removeAttribute('collapsed');
                  };
                }
              }
              delete block.storeAttributes;
            });
            delete header.collapsedBlocks;
          }

          // query for headers marked with the selection halo
          function  getSelectedHeaders() {
            const selectedHeaders = Array.from(
              document.querySelectorAll('[class*="header-block"] .notion-selectable-halo')
            ).map(halo => halo.parentElement);

            if (selectedHeaders.length > 0) return selectedHeaders;
            return null;
          }

          // toggle an array of headers
          function toggleHeaders(headers) {
            if (!headers) return;
            headers = headers
              .filter(h => 
                !( h.hasAttribute('collapsed') && h.dataset.collapsed === 'false' )
              );
            
            if (headers && headers.length > 0) {
              const collapsed = headers
                .filter(h => h.dataset.collapsed === 'true').length;
              headers.forEach(h => {
                if (collapsed >= headers.length) showHeaderContent(h);
                else collapseHeaderContent(h);
              });
            }
          }

          // get subsequent blocks
          function getHeaderContent(header) {
            let blockList = [];
            let nextBlock = header.nextElementSibling;
            while (nextBlock) {
              if (
                getHeaderLevel(nextBlock) <= getHeaderLevel(header) || 
                (
                  store().divBreak &&
                  nextBlock.classList &&
                  nextBlock.classList.contains('notion-divider-block')
                )
              ) break;
              blockList.push(nextBlock);
              nextBlock = nextBlock.nextElementSibling;
            }
            return blockList;
          }

          // toggles a header from one of its collapsed blocks
          function showBlockHeader(block) {
            if (
              block?.hasAttribute('collapsed') && 
              block.storeAttributes?.header
            ) {
              showHeaderContent(block.storeAttributes.header);
              return true;
            } 
            return false;
          }

          function getHeaderLevel(header) {
            if (!header.className || !header.className.includes('header-block')) return 9;
            const subCount = header.classList[1].match(/sub/gi) || '';
            let headerLevel = 1 + subCount.length;
            return headerLevel;
          }

          // ensures that any columns and indented blocks are also hidden
          // true => collapse, false => show
          function toggleInnerBlocks(block, collapse) {
            const header = block.storeAttributes?.header;
            Array.from(
              block.querySelectorAll('.notion-selectable')
            ).forEach(b => {
              if (!b.getAttribute('collapsed')) {
                if (collapse) {
                  if (!b.storeAttributes) {
                    b.storeAttributes = {
                      height: b.offsetHeight,
                      marginTop: b.style.marginTop,
                      marginBottom: b.style.marginBottom,
                      header: header,
                    };
                  }
                  b.setAttribute('collapsed', '')
                }
                else {
                  b.removeAttribute('collapsed');
                  delete b.storeAttributes;
                }
              }
            });
          }

          function showSelectedHeader() {
            setTimeout(() => {
              const halo = document.querySelector('.notion-selectable-halo');
              const header = halo?.parentElement;

              if (!header?.className?.includes('header-block')) return;
              
              // clear hash so that the same header can be toggled again
              location.hash = '';
              
              if (showBlockHeader(header)) {    
                setTimeout(
                  () => {
                    // is header in view?
                    var rect = header.getBoundingClientRect();
                    if (
                      (rect.top >= 0) && 
                      (rect.bottom <= window.innerHeight)
                    ) return;
                    // if not, scroll to header
                    header.scrollIntoView({ behavior: 'smooth' });
                  }, 400
                )
              }
            }, 0)
          }
        }
      });
    },
  },
};
