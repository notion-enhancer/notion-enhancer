/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, electron }, db) {
  const breadcrumbSelector =
      '.notion-topbar > div > :nth-child(2) > .notion-focusable:last-child',
    imgIconSelector = `${breadcrumbSelector} .notion-record-icon img`,
    nativeIconSelector = `${breadcrumbSelector} .notion-record-icon [role="image"]`,
    titleSelector = `${breadcrumbSelector} > :not(.notion-record-icon)`,
    viewSelector = '.notion-collection-view-select';

  let title = '',
    icon = '';
  const notionSetWindowTitle = __electronApi.setWindowTitle,
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

  await web.whenReady([titleSelector]);
  const $title = document.querySelector(titleSelector),
    $view = document.querySelector(viewSelector);
  if (!title && $title) {
    if ($view) {
      updateTitle(`${$title.innerText} | ${$view.innerText}`);
    } else updateTitle($title.innerText);
  }
}
