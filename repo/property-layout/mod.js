/*
 * property layout
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 alexander-kazakov
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '4034a578-7dd3-4633-80c6-f47ac5b7b160',
  tags: ['extension'],
  name: 'property layout',
  desc: 'auto-collapse page properties that usually push down page content.',
  version: '0.2.1',
  author: 'alexander-kazakov',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;

        var isVisible = false;

        function setPropertiesListVisibility(propertiesList, visible) {
          if (visible) {
            // Show properties list section
            propertiesList.style.height = null;
            propertiesList.style.display = null;
            isVisible = true;
          } else {
            // Hide properties list section
            propertiesList.style.height = 0;
            propertiesList.style.display = 'none';
            isVisible = false;
          }
        }

        // Called every time something new loads inside Notion window
        // e.g. you navigate to a different Notion page
        var onPageChange = function () {
          console.log('Notion Layout Improver: Something changed');

          // Find the block with properties list
          var propertiesLists = document.querySelectorAll(
            ".notion-scroller.vertical > div:nth-child(2)[style='width: 100%; font-size: 14px;']"
          );

          // For each found properties list
          propertiesLists.forEach(function (propertiesList) {
            console.log('Found properties list');

            // Set up the toggle button
            let toggleButton = document.createElement('button');
            toggleButton.setAttribute('class', 'propertiesToggleBar');
            toggleButton.innerHTML = '-';
            toggleButton.onclick = function () {
              setPropertiesListVisibility(propertiesList, !isVisible);
            };

            // If not already processed this properties list,
            // add the toggle button and hide the list
            if (!(propertiesList.id === 'already_processed')) {
              console.log(
                'Notion Layout Improver: Processing new properties list'
              );
              var parentBlockForButton =
                propertiesList.parentElement.firstChild.firstChild;
              parentBlockForButton.appendChild(toggleButton);
              setPropertiesListVisibility(propertiesList, false);
              propertiesList.id = 'already_processed';
            }
          });
        };

        // This calls onPageChange function each time Notion window changes
        // e.g. you navigate to a new Notion page
        const targetNode = document.body;
        const config = { attributes: false, childList: true, subtree: true };
        const observer = new MutationObserver(onPageChange);
        observer.observe(targetNode, config);
      });
    },
  },
};
