/*
 * weekly view
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 adihd
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '4c7acaea-6596-4590-85e5-8ac5a1455e8f',
  tags: ['extension'],
  name: 'weekly view',
  desc: 'calendar views named "weekly" will show only the 7 days of this week.',
  version: '0.5.1',
  author: 'adihd',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const attempt_interval = setInterval(enhance, 500);
      function enhance() {
        const notion_elem = document.querySelector('.notion-frame');
        if (!notion_elem) return;
        clearInterval(attempt_interval);
        handle([{ target: notion_elem }]);
        const observer = new MutationObserver(handle);
        observer.observe(notion_elem, {
          childList: true,
          subtree: true,
        });
        function handle(list, observer) {
          document
            .querySelectorAll('.notion-collection-view-select')
            .forEach((collection_view) => {
              if (collection_view.innerText.toLowerCase() !== 'weekly') return;
              const days = collection_view.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
                  'notion-calendar-view-day'
                ),
                today = [...days].find((day) => day.style.background),
                height = today
                  ? getComputedStyle(
                      today.parentElement.parentElement
                    ).getPropertyValue('height')
                  : 0;
              for (let day of days)
                day.parentElement.parentElement.style.height = 0;
              if (today)
                today.parentElement.parentElement.style.height = height;
            });
        }
      }
    },
  },
};
