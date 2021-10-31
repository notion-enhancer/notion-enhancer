/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const notificationsURL = 'https://notion-enhancer.github.io/notifications.json';

export default async function ({ env, fs, storage, registry, web }, db) {
  web.addHotkeyListener(await db.get(['hotkey']), env.focusMenu);

  const updateTheme = () =>
    storage.set(['theme'], document.querySelector('.notion-dark-theme') ? 'dark' : 'light');
  web.addDocumentObserver((mutation) => {
    if (mutation.target === document.body && document.hasFocus()) updateTheme();
  });
  if (document.hasFocus()) updateTheme();
  document.addEventListener('visibilitychange', updateTheme);

  const sidebarSelector = '.notion-sidebar-container .notion-sidebar > div:nth-child(4)';
  await web.whenReady([sidebarSelector]);

  const $sidebarLink = web.html`<div class="enhancer--sidebarMenuLink" role="button" tabindex="0">
      <div>
        <div>${await fs.getText('media/colour.svg')}</div>
        <div><div>notion-enhancer</div></div>
      </div>
    </div>`;
  $sidebarLink.addEventListener('click', env.focusMenu);

  const notifications = {
    cache: await storage.get(['notifications'], []),
    provider: await fs.getJSON(notificationsURL),
    count: (await registry.errors()).length,
  };
  for (const notification of notifications.provider) {
    if (
      !notifications.cache.includes(notification.id) &&
      notification.version === env.version &&
      (!notification.environments || notification.environments.includes(env.name))
    ) {
      notifications.count++;
    }
  }
  if (notifications.count) {
    web.render(
      $sidebarLink.children[0],
      web.html`<div class="enhancer--notificationBubble"><div><span>${notifications.count}</span></div></div>`
    );
  }

  web.render(document.querySelector(sidebarSelector), $sidebarLink);
}
