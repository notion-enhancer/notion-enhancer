/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import * as api from '../../api/_.mjs';
const { env, fs, storage, fmt, registry, web, components } = api;
import { tw } from './styles.mjs';

for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
  for (const sheet of mod.css?.menu || []) {
    web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
  }
  for (let script of mod.js?.menu || []) {
    script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
    script.default(api, await registry.db(mod.id));
  }
}
const errors = await registry.errors();
if (errors.length) {
  console.log('[notion-enhancer] registry errors:');
  console.table(errors);
}

export const notifications = {
  $container: web.html`<div class="notifications-container"></div>`,
  cache: await storage.get(['notifications'], []),
  provider: [registry.welcomeNotification, ...(await fs.getJSON(registry.notificationsURL))],
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
  const cached = notifications.cache.includes(notification.id),
    versionMatches = notification.version === env.version,
    envMatches = !notification.environments || notification.environments.includes(env.name);
  if (!cached && versionMatches && envMatches) notifications.add(notification);
}
if (errors.length) {
  notifications.add({
    icon: 'alert-circle',
    message: 'Failed to load mods (check console).',
    color: 'red',
  });
}
