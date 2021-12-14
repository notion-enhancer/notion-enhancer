/**
 * notion-enhancer: weekly view
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  const pageSelector = '.notion-page-content',
    calendarSelector = '.notion-calendar-view',
    viewSelector = '.notion-collection-view-select:not([data-weekly-view])',
    todaySelector = '.notion-calendar-view-day[style*="background"]',
    weekSelector = '[style^="position: relative; display: flex; height: "]',
    toolbarBtnSelector =
      '.notion-calendar-view > :first-child > :first-child > :first-child > :nth-last-child(2)';

  const transformCalendarView = () => {
    const $page = document.querySelector(pageSelector);
    document.querySelectorAll(viewSelector).forEach(async ($view) => {
      if ($view.innerText.toLowerCase() !== 'weekly') return;
      const $calendar = $view.parentElement.parentElement.parentElement.parentElement;
      if (!$calendar.querySelector(todaySelector)) {
        $calendar.querySelector(toolbarBtnSelector).click();
      }
      await new Promise((res, rej) => requestAnimationFrame(res));
      if ($page) {
        for (const $week of $calendar.querySelectorAll(weekSelector)) {
          if (!$week.querySelector(todaySelector)) $week.style.height = '0';
        }
      } else {
        const $weekContainer = $calendar.querySelector(weekSelector).parentElement;
        for (const $week of $calendar.querySelectorAll(weekSelector)) {
          if ($week.querySelector(todaySelector)) {
            $weekContainer.style.maxHeight = $week.style.height;
            break;
          } else {
            $week.style.height = '0';
            $week.style.opacity = '0';
          }
        }
      }
    });
  };
  web.addDocumentObserver(transformCalendarView, [calendarSelector]);
}
