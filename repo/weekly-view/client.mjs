/**
 * notion-enhancer: weekly view
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  const pageSelector = '.notion-page-content',
    calendarSelector = '.notion-calendar-view',
    viewSelector =
      '.notion-page-content > .notion-selectable.notion-collection_view-block',
    viewControlSelector = ':scope>div>div>div>div>div',
    todaySelector = '.notion-calendar-view-day[style*="background"]',
    weekSelector = '[style^="position: relative; display: flex; height: "]',
    toolbarBtnSelector =
      '.notion-calendar-view > :first-child > :first-child > :first-child > :nth-last-child(2)';

  const transformCalendarView = () => {
    const $page = document.querySelector(pageSelector);
    document.querySelectorAll(viewSelector).forEach(async ($view) => {    
      let currentText;  
      // Get view controls children nodes, convert to array, filter out non-text
      const viewNodes = []
        .slice.call($view.querySelector(viewControlSelector).children)
        .filter(node => node.tagName.toLowerCase().match(/(div|span)/g));

      // Find current view by analyzing children (which changes on viewport) 
      if (viewNodes.length === 1)
      {
        // Mobile: Simple dropdown button (like legacy), text is current view
        currentText = viewNodes[0].innerText.toLowerCase();
      } else {
        // Wide/Desktop: Tabs listed, current view indicated by border style
        currentText = viewNodes
          // Find selected view by border style (possibly fragile)
          .filter((e) => e.children[0].style.borderBottomWidth.toString() === '2px')[0]
          .innerText.toLowerCase();
      }
      
      if (currentText !== 'weekly') return;

      const $calendar = $view.parentElement.parentElement.parentElement.parentElement;
      if (!$calendar.querySelector(todaySelector)) {
        $calendar.querySelector(toolbarBtnSelector).click();
      }
      await new Promise((res, rej) => requestAnimationFrame(res));
      if ($page) {
        for (const $week of $calendar.querySelectorAll(weekSelector)) {
          if (!$week.querySelector(todaySelector)) {
            $week.style.height = 0;
            $week.style.visibility = 'hidden';
          }
        }
      } else {
        const $weekContainer = $calendar.querySelector(weekSelector).parentElement;
        for (const $week of $calendar.querySelectorAll(weekSelector)) {
          if ($week.querySelector(todaySelector)) {
            $weekContainer.style.maxHeight = $week.style.height;
            break;
          } else {
            $week.style.height = '0';
            $week.style.visibility = 'hidden';
          }
        }
      }
    });
  };
  web.addDocumentObserver(transformCalendarView, [calendarSelector]);
}
