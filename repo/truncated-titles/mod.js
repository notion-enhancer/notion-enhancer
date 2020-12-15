/*
 * truncated table titles
 * (c) 2020 admiraldus (https://github.com/admiraldus)
 * under the MIT license
 */

'use strict';

const PATH = require('path');
const FS = require('fs-extra');

module.exports = {
  id: '1794c0bd-7b96-46ad-aa0b-fc4bd76fc7fb',
  name: 'truncated table titles',
  tags: ['extension'],
  desc: 'see the full text of the truncated table titles on hover over.',
  version: '0.1.0',
  author: {
    name: 'admiraldus',
    link: 'https://github.com/admiraldus',
    avatar: 'https://raw.githubusercontent.com/admiraldus/admiraldus/main/module.gif',
  },
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', () => {
        if (document.readyState !== 'complete') return false;

        /**
         * Wait until frame exists to avoid "cannot read property" error.
         */
        function wait() {
          const frame = document.querySelector('.notion-frame');

          if (frame !== null) {
            (async () => {
              const notionOverlayContainer = document.querySelector('.notion-overlay-container');
              const createSvgContainer = document.createElement('div');
              const svgContainerHtml = await FS.readFile(PATH.resolve(`${__dirname}/icons/eye.svg`));

              createSvgContainer.innerHTML = svgContainerHtml;
              createSvgContainer.setAttribute('style', 'display: none;');
              createSvgContainer.classList.add('admiraldus-truncated-table-titles-rendered-svg');
              notionOverlayContainer.append(createSvgContainer);
            })();
          } else {
            setTimeout(wait, 500);
          }
        }

        wait();

        /**
         * Set the offset values of the created tooltip.
         *
         * @param   {HTMLDivElement}  cell     Target the table header cell.
         * @param   {HTMLDivElement}  tooltip  Target the created tooltip.
         *
         * @return  {string}                   Return the offset values.
         */
        function setTooltipOffset(cell, tooltip) {
          const body = document.querySelector('body');
          const sidebar = document.querySelector('.notion-sidebar:not([style*="transform"])');
          Object.defineProperty(Object.prototype, 'offset', {
            get: function() {
              return {
                left: this.getBoundingClientRect().left + window.scrollX,
                top: this.getBoundingClientRect().top + window.scrollY,
              };
            },
            configurable: true,
          });

          if (body.offsetWidth < tooltip.offsetWidth + cell.offset.left) {
            if (body.offsetWidth > cell.offsetWidth + cell.offset.left) {
              const horizontalOffset = `right: ${body.offsetWidth - cell.offsetWidth - cell.offset.left}px;`;

              return `top: ${cell.offset.top + 40}px; ${horizontalOffset}`;
            } else {
              const horizontalOffset = 'right: 8px;';

              return `top: ${cell.offset.top + 40}px; ${horizontalOffset}`;
            }
          } else if (sidebar == null && cell.offset.left <= 0) {
            const horizontalOffset = 'left: 8px;';

            return `top: ${cell.offset.top + 40}px; ${horizontalOffset}`;
          } else if (sidebar !== null && sidebar.offsetWidth >= cell.offset.left) {
            const horizontalOffset = `left: ${sidebar.offsetWidth + 8}px;`;

            console.warn('4');
            return `top: ${cell.offset.top + 40}px; ${horizontalOffset}`;
          } else {
            const horizontalOffset = `left: ${cell.offset.left}px;`;

            return `top: ${cell.offset.top + 40}px;${horizontalOffset}`;
          }
        }

        /**
         * Create and append tooltip HTML.
         *
         * @param   {HTMLDivElement}  cell  Target the table header cell.
         * @param   {string}          text  Get the title of the table header cell.
         * @param   {string}          icon  Get the HTML of the rendered svg.
         */
        function createTooltip(cell, text, icon) {
          const frame = document.querySelector('.notion-frame');
          const notionOverlayContainer = document.querySelector('.notion-overlay-container');
          const createTooltipContainer = document.createElement('div');
          const tooltipText = text.innerText;
          const tooltipIcon = icon;
          const tooltipContainerHtml =
              `<div>
                <div class="admiraldus-truncated-table-titles-tooltip-svg">
                ${tooltipIcon}
                </div>

                <div class="admiraldus-truncated-table-titles-tooltip-text">
                ${tooltipText}
                </div>
              </div>`;

          createTooltipContainer.innerHTML = tooltipContainerHtml;
          createTooltipContainer.classList.add('admiraldus-truncated-table-titles-tooltip');
          createTooltipContainer.setAttribute('style', `max-width: ${cell.offsetWidth >= 450 ? cell.offsetWidth / 2 + 450 >= frame.offsetWidth ? frame.offsetWidth - 16 : cell.offsetWidth / 2 + 450 : 450}px;`);
          notionOverlayContainer.append(createTooltipContainer);

          const tooltipOffset = setTooltipOffset(cell, document.querySelector('.admiraldus-truncated-table-titles-tooltip'));
          createTooltipContainer.setAttribute('style', createTooltipContainer.getAttribute('style') + tooltipOffset);
        }

        /**
         * Remove all tooltips from the DOM.
         */
        function removeTooltip() {
          if (document.querySelector('.admiraldus-truncated-table-titles-tooltip')) {
            while (document.querySelectorAll('.admiraldus-truncated-table-titles-tooltip').length !== 0) {
              document.querySelectorAll('.admiraldus-truncated-table-titles-tooltip').forEach((tooltip) => tooltip.remove());
            }
          }
        }

        const BODY = document.querySelector('body');
        let tooltipDelay = null;

        BODY.addEventListener('mousedown', () => {
          /**
           * When the drag is detected, set the global variable to true and remove all tooltips.
           */
          const dragStart = function() {
            window.isCellDragging = true;

            window.clearTimeout(tooltipDelay);
            removeTooltip();
          };

          /**
           * When the drag is over, set the global variable to false and remove the relevant event listeners.
           */
          const dragEnd = function() {
            window.isCellDragging = false;

            window.removeEventListener('mousemove', dragStart);
            window.removeEventListener('mouseup', dragEnd);
          };

          window.addEventListener('mousemove', dragStart);
          window.addEventListener('mouseup', dragEnd);
        });

        BODY.addEventListener('mouseenter', (event) => {
          const el = event.target;

          if (window.isCellDragging !== true) {
            if (el.classList.contains('notion-table-view-header-cell')) {
              if (el.querySelector('div[style*="text-overflow"]').scrollWidth > el.querySelector('div[style*="text-overflow"]').clientWidth) {
                tooltipDelay = window.setTimeout(function() {
                  createTooltip(el, el.querySelector('div[style*="text-overflow"]'), document.querySelector('.admiraldus-truncated-table-titles-rendered-svg').innerHTML);
                }, 1000);
              }
            }
          }
        }, true);

        BODY.addEventListener('mouseleave', (event) => {
          const el = event.target;

          if (el.classList.contains('notion-table-view-header-cell')) {
            if (el.querySelector('div[style*="text-overflow"]').scrollWidth > el.querySelector('div[style*="text-overflow"]').clientWidth) {
              window.clearTimeout(tooltipDelay);
              removeTooltip();
            }
          }
        }, true);

        console.info(
            '%cextension: ' +
            `%c${module.exports.name} ` +
            `%cfrom ${module.exports.author.name} ` +
            '%c(operational)', 'font-weight: bold;',
            'font-weight: normal',
            'font-style: italic;',
            'color: #a5d6a7;');
      });
    },
  },
};
