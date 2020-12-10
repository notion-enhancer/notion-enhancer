/*
 * tweaks
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 admiraldus (https://github.com/admiraldus)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'cf8a7b27-5a4c-4d45-a4cb-1d2bbc9e9014',
  alwaysActive: true,
  tags: ['core', 'extension'],
  name: 'tweaks',
  desc: 'common style/layout changes.',
  version: '0.2.0',
  author: 'dragonwocky',
  options: [
    {
      key: 'dragarea_height',
      label: 'height of frameless dragarea:',
      desc: `the rectangle added at the top of a window in "integrated titlebar" mode,\
        used to drag/move the window.`,
      type: 'input',
      value: 15,
      platformOverwrite: {
        darwin: 0,
      },
    },
    {
      key: 'responsive_breakpoint',
      label: 'width to wrap columns at:',
      desc: `the size in pixels below which in-page columns are resized to appear\
        full width so content isn't squished.`,
      type: 'input',
      value: 600,
    },
    {
      key: 'smooth_scrollbars',
      label: 'integrated scrollbars',
      desc:
        "use scrollbars that fit better into notion's ui instead of the default chrome ones.",
      type: 'toggle',
      value: true,
    },
    {
      key: 'snappy_transitions',
      label: 'snappy transitions',
      type: 'toggle',
      value: false,
    },
    {
      key: 'thicker_bold',
      label: 'thicker bold text',
      type: 'toggle',
      value: true,
    },
    {
      key: 'spaced_lines',
      label: 'more readable line spacing',
      type: 'toggle',
      value: false,
    },
    {
      key: 'hide_help',
      label: 'hide help button',
      type: 'toggle',
      value: false,
    },
    {
      key: 'hide_empty_sidebar_arrow',
      label: 'hide empty sidebar arrow',
      desc:
        'if the page does not have any subpages, hide the left arrow of the page in the sidebar.',
      type: 'toggle',
      value: false,
    },
    {
      key: 'condensed_bullets',
      label: 'condense bullet points',
      desc:
        'makes bullet point blocks closer together and have tighter line spacing',
      type: 'toggle',
      value: false,
    },
    {
      key: 'scroll_db_toolbars',
      label: 'scroll database toolbars',
      desc:
        'allows scrolling database toolbars horizontally if\
        part of the toolbar is hidden (hold shift while scrolling)',
      type: 'toggle',
      value: true,
    },
  ],
  hacks: {
    'renderer/preload.js': (store, __exports) => {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        document.body.dataset.tweaks = [
          'smooth_scrollbars',
          'snappy_transitions',
          'thicker_bold',
          'spaced_lines',
          'hide_help',
          'condensed_bullets',
          'scroll_db_toolbars',
        ]
          .filter((tweak) => store()[tweak])
          .map((tweak) => `[${tweak}]`)
          .join('');
        document.documentElement.style.setProperty(
          '--configured--dragarea_height',
          `${store().dragarea_height + 2}px`
        );
        const addResponsiveBreakpoint = () => {
          document.body.dataset.tweaks = document.body.dataset.tweaks.replace(
            /\[responsive_breakpoint\]/g,
            ''
          );
          if (window.outerWidth <= store().responsive_breakpoint)
            document.body.dataset.tweaks += '[responsive_breakpoint]';
        };
        window.addEventListener('resize', addResponsiveBreakpoint);
        addResponsiveBreakpoint();

        const hideEmptyPageArrow = () => {
          if (store().hide_empty_sidebar_arrow) {
            if (document.querySelector('.notion-sidebar') !== null) {
              const sidebar = document.querySelector('.notion-sidebar');
              const sidebarObserver = new MutationObserver(() => {
                const text_values = ['No pages inside', '하위 페이지가 없습니다'];
                const div_elems = sidebar.querySelectorAll('[data-block-id] div[style*="color"]');
                const empty_elems = Array.from(div_elems).filter(
                  (div) => text_values.some(text => div.textContent === text));

                Array.from(empty_elems).forEach((empty) => {
                  empty.closest('[data-block-id]')
                  .querySelector('a > div > div > div > div[role="button"]:not(.notion-record-icon)')
                  .classList.add('tweaks-arrow');
                });

                const tweak_arrows = document.querySelectorAll('.tweaks-arrow');

                tweak_arrows.forEach((arrow) => {
                  if (arrow.closest('[data-block-id]').querySelector('[data-block-id]') !== null) {
                    arrow.classList.remove('tweaks-arrow');
                  }
                });
              });

              sidebarObserver.observe(sidebar,{subtree: true, childList: true});
              document.body.dataset.tweaks += '[hide_empty_sidebar_arrow]';
            } else {
              setTimeout(hideEmptyPageArrow, 500);
            }
          }
        };
        hideEmptyPageArrow();
      });
    },
  },
};
