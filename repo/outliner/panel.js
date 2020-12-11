/*
 * outliner
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require("../../pkg/helpers");

module.exports = (store, __exports) => {
  let lastSearch;

  // Observe for page changes
  const pageObserver = new MutationObserver((list, observer) => {
    for ( let { addedNodes } of list) {
      if (addedNodes[0]) {
        if (addedNodes[0].className === 'notion-page-content') {
          startContentObserver();
        }
        // Clear outline on database pages
        else if (addedNodes[0].className === 'notion-scroller') {
          contentObserver.disconnect();
          const outline = document.querySelector('.outliner');
          if (outline) outline.textContent = '';
        }
      } 
    }
  });

  // Observe for header changes
  const contentObserver = new MutationObserver((list, observer) => {
    list.forEach(m => {
      let header;
      if (
        (
          m.type === 'childList' &&
          (
            m.target.hasAttribute('placeholder') ||
            m.target.className?.includes('header-block')
          ) &&
          (
            (header = getHeaderBlock(m.target)) ||
            (header = getHeaderBlock(m.addedNodes[0]))
          )
        ) ||
        (
          m.type === 'characterData' &&
          (header = getHeaderBlock(m.target.parentElement))
        )
      ) updateOutlineHeader(header);

      else if (
        m.type === 'childList' && m.removedNodes[0] &&
        (
          isHeaderElement(m.removedNodes[0]) ||
          m.removedNodes[0].querySelector?.('[class*="header-block"]')
        )
      ) findHeaders();
    })
  });

  function startContentObserver() {
    findHeaders();
    contentObserver.disconnect();
    contentObserver.observe(
      document.querySelector('.notion-page-content'),
      {
        childList: true,
        subtree: true,
        characterData: true,
      }
    );
  }

  function findHeaders() {
    // Add cooldown to prevent the function being run twice at the 'same' time
    if (lastSearch >= (Date.now() - 10)) return;
    lastSearch = Date.now();
    
    const outline = document.querySelector('.outliner');
    if (!outline) return;
    outline.textContent = '';

    const pageContent = document.querySelector('.notion-page-content'),
      headerBlocks = pageContent.querySelectorAll('[class*="header-block"]'),
      fragment = new DocumentFragment();

    headerBlocks.forEach(header => {
      const blockId = header.dataset.blockId.replace(/-/g, ''),
        headerEl = header.querySelector('[placeholder]'),
        placeholder = headerEl.getAttribute('placeholder');

      const outlineHeader = createElement(`
        <div class="outline-header" header-level="${placeholder.slice(-1)}">
          <a href="${window.location.pathname}#${blockId}" class="outline-link"
            outline-placeholder="${placeholder}"></a>
        </div>
      `);
      header.outline = outlineHeader;
      outlineHeader.firstElementChild.innerHTML = headerEl.innerHTML;

      fragment.appendChild(outlineHeader);
    })

    outline.appendChild(fragment);
  }

  function updateOutlineHeader(header) {
    const headerEl = header.querySelector('[placeholder]');
    if (!(
      headerEl &&
      header.outline?.parentElement
    )) return findHeaders();
    const outlineHeader = header.outline;
    outlineHeader.firstElementChild.innerHTML = headerEl.innerHTML;
    setOutlineLevel(outlineHeader, headerEl.getAttribute('placeholder').slice(-1));
  }

  function setOutlineLevel(outlineHeader, level) {
    outlineHeader.setAttribute('header-level', level);
    outlineHeader.firstElementChild.setAttribute('outline-placeholder', `Header ${level}`)
  }

  function getHeaderBlock(el) {
    return el?.closest?.('[class*="header-block"]');
  }

  function isHeaderElement(el) {
    let placeholder;
    if (el) {
      placeholder = el.getAttribute?.('placeholder') || 
        el.querySelector?.('[placeholder]')?.getAttribute('placeholder');
    }
    if (!placeholder) placeholder = '';
    return placeholder.includes('Heading');
  }

  return {
    onLoad() {
      if (store().lined) {
        const outline = document.querySelector('.outliner');
        outline?.setAttribute('lined', '');
      }

      // Find headers when switching panels
      if (document.querySelector('.notion-page-content')) {
        startContentObserver();
      };    
      pageObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    },
    onSwitch() {
      pageObserver.disconnect();
      contentObserver.disconnect();
    }
  }
}
