/*
 * sticky toc
 * (c) 2020 varontron <varontron@gmail.com>
 * under the MIT license
 */

'use strict';


module.exports = {
  id: '3d1b03fe-a847-45bd-a317-7f082546abab',
  tags: ['extension'],
  name: 'sticky toc',
  desc:
    `Sticks a table of contents in place (no scroll) when it's put in a column`,
  version: '0.1.0',
  author: 'varontron',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500)
        function enhance() {
          const notion_elem = document.querySelector('.notion-frame')
          if (!notion_elem) return;
          clearInterval(attempt_interval)

          handle();
          const observer = new MutationObserver(handle);
          observer.observe(notion_elem, {
            childList: true,
            subtree: true,
          })

          function handle(list, observer) {
            const toc = document.querySelector('.notion-table_of_contents-block')
            if (toc !== null
                && toc.parentElement.style.position === 'sticky') return;
            if (toc !== null && toc.closest('.notion-column-block') !== null)
            {
              let origCss = toc.parentElement.style.cssText
              toc.parentElement.style.cssText = `${origCss} position:sticky; top: 0; align-self: flex-start;`
            }
          }
        }
      })
    }
  }
};
