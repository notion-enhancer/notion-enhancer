/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ electron }, db) {
  let title = '',
    icon = '';
  const notionSetWindowTitle = __electronApi.setWindowTitle,
    imgIconSelector =
      '.notion-topbar > div > :nth-child(2) > .notion-focusable:last-child .notion-record-icon img',
    nativeIconSelector =
      '.notion-topbar > div > :nth-child(2) > .notion-focusable:last-child .notion-record-icon [role="image"]',
    getIcon = () => {
      const $imgIcon = document.querySelector(imgIconSelector),
        $nativeIcon = document.querySelector(nativeIconSelector);
      if ($imgIcon) {
        return $imgIcon.style.background.replace(
          /url\("\/images/,
          'url("notion://www.notion.so/images'
        );
      }
      if ($nativeIcon) return $nativeIcon.ariaLabel;
      return '';
    },
    updateTitle = (newTitle = title) => {
      if (!newTitle) return;
      title = newTitle;
      icon = getIcon();
      electron.sendMessageToHost('set-tab-title', title);
      electron.sendMessageToHost('set-tab-icon', icon);
      notionSetWindowTitle(title);
    };
  __electronApi.setWindowTitle = (newTitle) => updateTitle(newTitle);
  document.addEventListener('focus', updateTitle);
  electron.onMessage('trigger-title-update', () => updateTitle());
}
