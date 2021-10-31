/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { env, fs, storage, fmt, web, components } from '../../api/_.mjs';
import { tw } from './styles.mjs';

const notificationsURL = 'https://notion-enhancer.github.io/notifications.json';
export const notifications = {
  $container: web.html`<div class="notifications-container"></div>`,
  cache: await storage.get(['notifications'], []),
  provider: await fs.getJSON(notificationsURL),
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

const lastReadChangelog = await storage.get(['last_read_changelog']),
  $changelogModalButton = web.html`<button type="button" class="modal-button">
    Accept & Continue
  </button>`;
export const $changelogModal = web.render(
  web.html`<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-overlay" aria-hidden="true"></div>
  </div>`,
  web.render(
    web.html`<div class="modal-box"></div>`,
    web.html`<div class="modal-body">
        <div class="modal-title">
          ${(await fs.getText('media/colour.svg')).replace(
            /width="\d+" height="\d+"/,
            `class="modal-title-icon"`
          )}
          <div>
            <h1 class="modal-title-heading">
              notion-enhancer v${env.version}
            </h1>
            <p class="modal-title-description">
              an enhancer/customiser for the all-in-one productivity workspace notion.so
            </p>
          </div>
        </div>
        <div class="modal-content">
          <h3 class="modal-content-heading">welcome</h3>
          <p>
            hi! i'm dragonwocky, the creator of the notion-enhancer.
            if you're seeing this, you've just installed or updated to a new
            version of the enhancer. you should check out the
            <a href="https://notion-enhancer.github.io/getting-started" class="link" target="_blank">getting started</a>
            guide for a quick overview of how to use it. for extra support
            or to chat with others who use the enhancer, you can join our
            <a href="https://discord.com/invite/sFWPXtA" class="link" target="_blank">discord server</a>.
          </p>
          <p class="mt-1">
            p.s. maintaining and updating the enhancer takes a lot of time and work.
            if you would like to support future development of the enhancer, please consider
            <a href="https://buy.stripe.com/00gdR93R6csIgDKeUV" class="link" target="_blank">making a donation</a>.
          </p>
          <h3 class="modal-content-heading">license</h3>
          <p>
            the enhancer is developed publicly on
            <a href="https://github.com/notion-enhancer/" class="link" target="_blank">github</a>
            as an open-source project under the
            <a href="https://notion-enhancer.github.io/license" class="link" target="_blank">mit license</a>.
            in summary:
          </p>
          <ul class="modal-content-list">
            <li>you are free to use or modify the enhancer in any way</li>
            <li>
              copyright of the enhancer and its parts goes to their respective
              creators and must be attributed
            </li>
            <li>
              though the enhancer aims for high quality,
              it comes with no warranty and its creators are not
              liable for any potential consequences of use
              nor do they have any legal responsibility to provide
              continued updates or support
            </li>
          </ul>
          <h3 class="modal-content-heading">what's new</h3>
          <div class="markdown">
            ${fmt.md.render(await fs.getText('repo/menu/whats-new.md'))}
          </div>
        </div>
      </div>`,
    web.render(web.html`<div class="modal-actions"></div>`, $changelogModalButton)
  )
);
web.render(document.body, $changelogModal);
if (lastReadChangelog !== env.version) {
  $changelogModal.classList.add('modal-visible');
}
$changelogModalButton.addEventListener('click', async () => {
  $changelogModal.classList.remove('modal-visible');
  await storage.set(['last_read_changelog'], env.version);
});
