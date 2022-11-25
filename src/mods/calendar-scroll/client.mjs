/**
 * notion-enhancer: calendar scroll
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const pageSelector = '.notion-page-content',
  calendarSelector = '.notion-calendar-view:not([data-calendar-scroll])',
  scrollerSelector = '.notion-frame > .notion-scroller',
  toolbarSelector = '.notion-calendar-view > :first-child > :first-child > :first-child',
  todaySelector = '.notion-calendar-view-day[style*="background:"]';

export default function ({ web }, db) {
  const insertButton = () => {
    document.querySelectorAll(calendarSelector).forEach(($calendar) => {
      $calendar.dataset.calendarScroll = true;
      const $page = document.querySelector(pageSelector);
      if ($page) return;
      const $toolbar = $calendar.querySelector(toolbarSelector),
        $pageScroller = document.querySelector(scrollerSelector),
        $scrollButton = web.html`<button id="enhancer--calendar-scroll">Scroll</button>`;
      $scrollButton.addEventListener('click', async (event) => {
        let $today = $calendar.querySelector(todaySelector);
        if (!$today) {
          $toolbar.children[4].click();
          await new Promise((res, rej) => setTimeout(res, 500));
          $today = $calendar.querySelector(todaySelector);
        }
        $pageScroller.scroll({
          top: $today.offsetParent.offsetParent.offsetTop + 70,
          behavior: 'auto',
        });
      });
      $toolbar.insertBefore($scrollButton, $toolbar.children[2]);
    });
  };
  web.addDocumentObserver(insertButton, [calendarSelector]);
  insertButton();
}
