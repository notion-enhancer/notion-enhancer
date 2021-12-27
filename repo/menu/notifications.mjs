/**
 * notion-enhancer: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { env, fs, storage, web, components } from '../../api/index.mjs';
import { tw } from './styles.mjs';

import '../../dep/markdown-it.min.js';
const md = markdownit({ linkify: true });

const notificationsURL = 'https://notion-enhancer.github.io/notifications.json';
export const notifications = {
  $container: web.html`<div class="notifications-container"></div>`,
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
          ${md.renderInline(message)}
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

(async () => {
  notifications.cache = await storage.get(['notifications'], []);
  notifications.provider = await fs.getJSON(notificationsURL);

  web.render(document.body, notifications.$container);
  for (const notification of notifications.provider) {
    const cached = notifications.cache.includes(notification.id),
      versionMatches = notification.version === env.version,
      envMatches = !notification.environments || notification.environments.includes(env.name);
    if (!cached && versionMatches && envMatches) notifications.add(notification);
  }
})();

export const $changelogModal = web.render(
  web.html`<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-overlay" aria-hidden="true"></div>
  </div>`
);

(async () => {
  const $changelogModalButton = web.html`<button type="button" class="modal-button">
    Accept & Continue
  </button>`;
  $changelogModalButton.addEventListener('click', async () => {
    $changelogModal.classList.remove('modal-visible');
    await storage.set(['last_read_changelog'], env.version);
  });

  web.render(
    $changelogModal,
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
          <p>
            Welcome to the notion-enhancer! For help getting started, check out the
            <a href="https://notion-enhancer.github.io/getting-started/basic-usage/" class="link" target="_blank">
            basic usage</a> guide. If you've upgraded from a previous version of the notion-enhancer, you can see
            what's new <a href="https://notion-enhancer.github.io/about/changelog/" class="link">here</a>.
          </p>
          <p>
            If you spot a bug or have a new feature idea, have a read through the
            <a href="https://notion-enhancer.github.io/about/contributing/" class="link">Contributing</a>
            guide to learn how & where to talk to us about it. For extra support, come join our
            <a href="https://discord.com/invite/sFWPXtA" class="link" target="_blank">Discord community</a>.
          </p>
          <p>
            Maintaining and updating the notion-enhancer does take a lot of time and work,
            so if you'd like to support future development
            <a href="https://buy.stripe.com/00gdR93R6csIgDKeUV" class="important-link" target="_blank">
            please consider making a donation</a>.
          </p>
          <p>
            By clicking &quot;Accept & Continue&quot; below you agree to the notion-enhancer's
            <a href="https://notion-enhancer.github.io/about/privacy-policy/" class="link">Privacy Policy</a> and
            <a href="https://notion-enhancer.github.io/about/terms-and-conditions/" class="link">Terms & Conditions</a>.
          </p>
        </div>
      </div>`,
      web.render(web.html`<div class="modal-actions"></div>`, $changelogModalButton)
    )
  );

  const lastReadChangelog = await storage.get(['last_read_changelog']);
  web.render(document.body, $changelogModal);
  if (lastReadChangelog !== env.version) {
    $changelogModal.classList.add('modal-visible');
  }
})();
