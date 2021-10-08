/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { env, fs, storage, fmt, registry, web, components } from '../../api/_.mjs';
import { tw } from './styles.mjs';

export const notifications = {
  $container: web.html`<div class="notifications-container"></div>`,
  cache: await storage.get(['notifications'], []),
  provider: [
    registry.welcomeNotification,
    ...(await fs.getJSON('https://notion-enhancer.github.io/notifications.json')),
  ],
  async add({ icon, message, id = undefined, color = undefined, link = undefined }) {
    const $notification = link
        ? web.html`<a
          href="${web.escape(link)}"
          class="${tw`notification-${color || 'default'}`}"
          role="alert"
          target="_blank"
        ></a>`
        : web.html`<p
          class="${tw`notification-${color || 'default'}`}"
          role="alert"
          tabindex="0"
        ></p>`,
      resolve = async () => {
        if (id !== undefined) {
          notifications.cache.push(id);
          await storage.set(['notifications'], notifications.cache);
        }
        $notification.remove();
      };
    $notification.addEventListener('click', resolve);
    $notification.addEventListener('keyup', (event) => {
      if (['Enter', ' '].includes(event.key)) resolve();
    });
    web.render(
      notifications.$container,
      web.render(
        $notification,
        web.html`<span class="notification-text markdown-inline">
          ${fmt.md.renderInline(message)}
        </span>`,
        web.html`${await components.feather(icon, { class: 'notification-icon' })}`
      )
    );
    return $notification;
  },
  _onChange: false,
  async onChange() {
    if (this._onChange) return;
    this._onChange = true;
    const $notification = await this.add({
      icon: 'refresh-cw',
      message: 'Reload to apply changes.',
    });
    $notification.addEventListener('click', env.reload);
  },
};
web.render(document.body, notifications.$container);
for (const notification of notifications.provider) {
  if (
    !notifications.cache.includes(notification.id) &&
    notification.version === env.version &&
    (!notification.environments || notification.environments.includes(env.name))
  ) {
    notifications.add(notification);
  }
}

const errors = await registry.errors();
if (errors.length) {
  console.log('[notion-enhancer] registry errors:');
  console.table(errors);
  notifications.add({
    icon: 'alert-circle',
    message: 'Failed to load mods (check console).',
    color: 'red',
  });
}
