/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, electron }, db) {
  const newTabHotkey = await db.get(['new_tab']),
    closeTabHotkey = await db.get(['close_tab']),
    restoreTabHotkey = await db.get(['restore_tab']),
    selectTabModifier = await db.get(['select_modifier']);
  web.addHotkeyListener(newTabHotkey, () => {
    electron.sendMessageToHost('new-tab');
    console.log('new-tab');
  });
  web.addHotkeyListener(restoreTabHotkey, () => {
    electron.sendMessageToHost('restore-tab');
    console.log('restore-tab');
  });
  web.addHotkeyListener(closeTabHotkey, () => electron.sendMessageToHost('close-tab'));
  for (let i = 1; i < 10; i++) {
    web.addHotkeyListener([selectTabModifier, i.toString()], () => {
      electron.sendMessageToHost('select-tab', i);
    });
  }

  const breadcrumbSelector =
      '.notion-topbar > div > [class="notranslate"] > .notion-focusable:last-child',
    imgIconSelector = `${breadcrumbSelector} .notion-record-icon img:not(.notion-emoji)`,
    emojiIconSelector = `${breadcrumbSelector} .notion-record-icon img.notion-emoji`,
    nativeIconSelector = `${breadcrumbSelector} .notion-record-icon [role="image"]`,
    titleSelector = `${breadcrumbSelector} > :not(.notion-record-icon)`,
    viewSelector = '.notion-collection-view-select';

  let title = '',
    icon = '';
  const notionSetWindowTitle = __electronApi.setWindowTitle,
    getIcon = () => {
      const $imgIcon = document.querySelector(imgIconSelector),
        $emojiIcon = document.querySelector(emojiIconSelector),
        $nativeIcon = document.querySelector(nativeIconSelector);
      if ($imgIcon) {
        return `url("${$imgIcon.src}") 0 / 100%`;
      }
      if ($emojiIcon) {
        return $emojiIcon.style.background.replace(
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
