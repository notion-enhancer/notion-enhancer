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
        let queue = [];
        const observer = new MutationObserver((list, observer) => {
          if (!queue.length) requestAnimationFrame(process);
          queue.push(...list);
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
        });
        function process() {
          queue = [];

          for (let elem of document.getElementsByClassName(
            'notion-collection-view-select'
          )) {
            // console.log("this is working2");
            if (elem.innerText === 'weekly') {
              // console.log("this is working3");
              var days_list = elem.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
                'notion-calendar-view-day'
              );
              for (let index = 0; index < days_list.length; index++) {
                // const element = array[index];
                if (days_list[index].style.background) {
                  days_list[index].parentElement.parentElement.classList.add(
                    'this_week'
                  );
                  // console.log("yay");
                }
              }
              var weeks = document.getElementsByClassName('this_week')[0]
                .parentElement.children;
              // delete al div that not contain a class of "this_week"
              while (weeks.length > 1) {
                for (let index = 0; index < weeks.length; index++) {
                  // const element = array[index];

                  if (weeks[index].classList.contains('this_week')) {
                    console.log('yes');
                  } else {
                    // console.log(index);
                    weeks[index].remove();
                  }
                }
              }
            }
          }
        }
      });
    },
  },
};
