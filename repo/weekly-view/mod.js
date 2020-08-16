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
  desc: 'view 7-day calendars.',
  version: '0.5.0',
  author: 'adihd',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const observer = new MutationObserver((list, observer) => {
          document
            .querySelectorAll('.notion-collection-view-select > :nth-child(2)')
            .forEach((collection_view) => {
              if (collection_view.innerText === 'weekly') {
                collection_view =
                  collection_view.parentElement.parentElement.parentElement
                    .parentElement.parentElement;
                // collection_view.classList.add('weekly_view');
                // document
                //   .querySelectorAll('.adi_week_cal .notion-calendar-view-day')
                //   .forEach((day) => {
                //     if (day.style.background)
                //       day.parentElement.parentElement.classList.add(
                //         'this_week'
                //       );
                //   });
                // var weeks = document.querySelectorAll('.this_week')[0].parentElement
                //   .children;
                // // delete al div that not contain a class of "this_week"
                // while (weeks.length > 1) {
                //   for (let index = 0; index < weeks.length; index++) {
                //     // const element = array[index];
                //     if (weeks[index].classList.contains('this_week')) {
                //       console.log('yes');
                //     } else {
                //       // console.log(index);
                //       weeks[index].remove();
                //     }
                //   }
                // }
              }
            });
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      });
    },
  },
};
