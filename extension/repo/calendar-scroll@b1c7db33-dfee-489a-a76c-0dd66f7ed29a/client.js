/*
 * notion-enhancer core: bypass-preview
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web } from '../../api/_.mjs';

const $button = web.createElement(
  web.html`<button id="calendar-scroll-to-week">Scroll</button>`
);
$button.addEventListener('click', async (event) => {
  let $day = document.querySelector('.notion-calendar-view-day[style*="background:"]');
  while (!$day) {
    const $toolbar = document.querySelector(
        '.notion-calendar-view > :first-child > :first-child > :first-child'
      ),
      year = +$toolbar.children[0].innerText.split(' ')[1],
      month = {
        'January': 0,
        'February': 1,
        'March': 2,
        'April': 3,
        'May': 4,
        'June': 5,
        'July': 6,
        'August': 7,
        'September': 8,
        'October': 9,
        'November': 10,
        'December': 11,
      }[$toolbar.children[0].innerText.split(' ')[0]],
      now = new Date();
    switch (true) {
      case now.getFullYear() < year:
      case now.getFullYear() === year && now.getMonth() < month:
        $toolbar.children[3].click();
        break;
      case now.getFullYear() > year:
      case now.getFullYear() === year && now.getMonth() > month:
        $toolbar.children[5].click();
        break;
      default:
        await new Promise((res, rej) => requestAnimationFrame(res));
        $day = document.querySelector('.notion-calendar-view-day[style*="background:"]');
    }
    await new Promise((res, rej) => requestAnimationFrame(res));
  }
  const $scroller = document.querySelector('.notion-frame .notion-scroller');
  $scroller.scroll({
    top: $day.offsetParent.offsetParent.offsetTop + 70,
    behavior: 'auto',
  });
});

web.addDocumentObserver((event) => {
  if (document.contains($button)) return;
  const toolbar = document.querySelector(
    '.notion-calendar-view > :first-child > :first-child > :first-child'
  );
  if (toolbar) toolbar.insertBefore($button, toolbar.children[2]);
});
