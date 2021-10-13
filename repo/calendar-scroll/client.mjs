/*
 * notion-enhancer: calendar scroll
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default function ({ web }, db) {
  const toolbarSelector = '.notion-calendar-view > :first-child > :first-child > :first-child',
    $scrollButton = web.html`<button id="enhancer--calendar-scroll">Scroll</button>`;
  $scrollButton.addEventListener('click', async (event) => {
    const $toolbar = document.querySelector(toolbarSelector),
      now = new Date(),
      thisYear = now.getFullYear(),
      thisMonth = now.getMonth(),
      allMonths = {
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
      };
    let $today;
    while (!$today) {
      const visibleYear = +$toolbar.children[0].innerText.split(' ')[1],
        visibleMonth = allMonths[$toolbar.children[0].innerText.split(' ')[0]];
      switch (true) {
        case thisYear < visibleYear:
        case thisYear === visibleYear && thisMonth < visibleMonth:
          $toolbar.children[3].click();
          break;
        case thisYear > visibleYear:
        case thisYear === visibleYear && thisMonth > visibleMonth:
          $toolbar.children[5].click();
          break;
        default:
          $today = document.querySelector('.notion-calendar-view-day[style*="background:"]');
      }
      await new Promise((res, rej) => requestAnimationFrame(res));
    }
    const $scroller = document.querySelector('.notion-frame .notion-scroller');
    $scroller.scroll({
      top: $today.offsetParent.offsetParent.offsetTop + 70,
      behavior: 'auto',
    });
  });

  const insertButton = () => {
    if (document.contains($scrollButton)) return;
    const $toolbar = document.querySelector(toolbarSelector);
    if ($toolbar) $toolbar.insertBefore($scrollButton, $toolbar.children[2]);
  };
  web.addDocumentObserver(insertButton, ['.notion-calendar-view']);
  insertButton();
}
