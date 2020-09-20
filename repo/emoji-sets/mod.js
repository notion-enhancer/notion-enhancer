/*
 * emoji sets
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'a2401ee1-93ba-4b8c-9781-7f570bf5d71e',
  tags: ['extension'],
  name: 'emoji sets',
  desc: 'pick from a variety of emoji styles to use.',
  version: '0.2.0',
  author: 'dragonwocky',
  options: [
    {
      key: 'style',
      label: '',
      type: 'select',
      value: [
        'twitter',
        'apple',
        'google',
        'microsoft',
        'samsung',
        'whatsapp',
        'facebook',
        'joypixels',
        'openmoji',
        'emojidex',
        'messenger',
        'lg',
        'htc',
        'mozilla',
      ],
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const useNative =
        (store().style === 'microsoft' && process.platform === 'win32') ||
        (store().style === 'apple' && process.platform === 'darwin');

      Object.defineProperty(navigator, 'userAgent', {
        get: function () {
          // macOS useragent uses system emojis instead of images
          // = no need to download
          return useNative
            ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15 Notion/2.0.9 Electron/6.1.5'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Notion/2.0.9 Chrome/76.0.3809.146 Electron/6.1.5 Safari/537.36';
        },
      });

      if (!useNative) {
        let tweaked = false;

        document.addEventListener('readystatechange', (event) => {
          if (document.readyState !== 'complete') return false;
          let queue = [];
          const observer = new MutationObserver((list, observer) => {
            if (!queue.length) requestAnimationFrame(process);
            queue.push(...list);
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
          });
          function process() {
            queue = [];
            if (store().style !== 'twitter' || tweaked) {
              document
                .querySelectorAll(
                  '[src*="notion-emojis.s3"]:not(.notion-emoji)'
                )
                .forEach((el) => el.remove());
              document.querySelectorAll('.notion-emoji').forEach((el) => {
                el.style.setProperty(
                  'background',
                  `url(https://emojicdn.elk.sh/${el.getAttribute(
                    'alt'
                  )}?style=${store().style})`
                );
                el.style.setProperty('background-size', 'contain');
                el.style.setProperty('opacity', '1');
              });
              tweaked = true;
            }
          }
        });
      }
    },
  },
};
