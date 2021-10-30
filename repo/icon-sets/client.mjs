/*
 * notion-enhancer: icon sets
 * (c) 2019 jayhxmo (https://jaymo.io/)
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default async function ({ web, components, notion }, db) {
  const recentUploads = await db.get(['recent_uploads'], []),
    $triangleSvg = web.html`<svg viewBox="0 0 100 100" class="triangle">
      <polygon points="5.9,88.2 50,11.8 94.1,88.2" />
    </svg>`;

  const mediaMenuSelector = '.notion-media-menu',
    mediaScrollerSelector = '.notion-media-menu > .notion-scroller',
    mediaFilterSelector = '.notion-media-menu > :first-child > :last-child',
    mediaLinkInputSelector = '.notion-focusable-within > input[type=url]',
    tabBtnSelector = (n) =>
      `.notion-media-menu > :first-child > :first-child > :nth-child(${n})`;

  const renderSetTitle = async (id, title, $tooltip = undefined) => {
    const isCollapsed = await db.get(['collapsed', id], false),
      $title = web.html`<p class="icon_sets--title"
            ${isCollapsed ? 'data-collapsed="true"' : ''}></p>`;
    web.render(
      $title,
      $triangleSvg.cloneNode(true),
      web.html`<span>${web.escape(title)}</span>`
    );
    $title.addEventListener('click', () => {
      const newState = $title.dataset.collapsed !== 'true';
      db.set(['collapsed', id], newState);
      $title.dataset.collapsed = newState;
    });
    if ($tooltip) {
      const $infoSvg = web.html`${await components.feather('info', { class: 'info' })}`;
      components.setTooltip($infoSvg, $tooltip);
      web.render($title, $infoSvg);
    }
    return $title;
  };

  const $iconsTab = web.html`<div class="icon_sets--tab_button">
      <div class="notion-focusable" role="button" tabindex="0">Icons</div>
    </div>`,
    // actions
    $iconsLinkInput = web.html`<div class="icon_sets--link_input">
      <input placeholder="Paste an image link…" type="url">
    </div>`,
    $iconsLinkSubmit = web.html`<button class="icon_sets--link_submit">Submit</button>`,
    $iconsUploadFile = web.html`<input type="file" accept="image/*" style="display:none">`,
    $iconsUploadSubmit = web.render(
      web.html`<button class="icon_sets--upload"></button>`,
      'Upload an image',
      $iconsUploadFile
    ),
    // sets
    $setsList = web.html`<div class="icon_sets--list"></div>`,
    $recentUploadsTitle = await renderSetTitle(
      'recent_uploads',
      'Recent',
      web.html`<p><b>Click</b> to reuse an icon <br><b>Shift-click</b> to remove it</p>`
    ),
    $recentUploads = web.html`<div class="icon_sets--set"></div>`,
    // container
    $iconsScroller = web.render(
      web.html`<div class="icon_sets--scroller" style="display:none"></div>`,
      web.render(
        web.html`<div class="icon_sets--actions"></div>`,
        $iconsLinkInput,
        $iconsLinkSubmit,
        $iconsUploadSubmit
      ),
      web.render($setsList, $recentUploadsTitle, $recentUploads)
    );

  let $mediaMenu, $activeTabUnderline;
  const insertIconsTab = async (event) => {
    if (document.contains($mediaMenu)) return;

    // prevent injection into file upload menus
    $mediaMenu = document.querySelector(mediaMenuSelector);
    if (!$mediaMenu || !$mediaMenu.textContent.includes('Emoji')) return;

    const $emojiTab = document.querySelector(tabBtnSelector(1)),
      $emojiScroller = document.querySelector(mediaScrollerSelector),
      $emojiFilter = document.querySelector(mediaFilterSelector),
      $uploadTab = document.querySelector(tabBtnSelector(2)),
      $linkTab = document.querySelector(tabBtnSelector(3));
    $uploadTab.style.display = 'none';
    $linkTab.style.display = 'none';
    if ($activeTabUnderline) $activeTabUnderline.remove();
    $activeTabUnderline =
      $emojiTab.children[1] || $uploadTab.children[1] || $linkTab.children[1];
    $emojiTab.after($iconsTab);
    $emojiScroller.after($iconsScroller);

    const renderRecentUploads = () => {
        web.empty($recentUploads);
        for (let i = recentUploads.length - 1; i >= 0; i--) {
          const { signed, url } = recentUploads[i],
            $icon = web.html`<span class="icon_sets--icon">
              <img src="${web.escape(signed)}">
            </span>`;
          web.render($recentUploads, $icon);
          $icon.addEventListener('click', (event) => {
            if (event.shiftKey) {
              recentUploads.splice(i, 1);
              db.set(['recent_uploads'], recentUploads);
              $icon.remove();
            } else setIcon(url);
          });
        }
        $recentUploads.style.height = `${$recentUploads.scrollHeight}px`;
      },
      renderSets = async () => {};

    const displayIconsTab = (force = false) => {
        if ($iconsTab.contains($activeTabUnderline) && !force) return;
        web.render($iconsTab, $activeTabUnderline);
        $iconsScroller.style.display = '';
        $emojiScroller.style.display = 'none';
        $emojiFilter.style.display = 'none';
        renderRecentUploads();
      },
      displayEmojiTab = (force = false) => {
        if ($emojiTab.contains($activeTabUnderline) && !force) return;
        web.render($emojiTab, $activeTabUnderline);
        $iconsScroller.style.display = 'none';
        $emojiScroller.style.display = '';
        $emojiFilter.style.display = '';
      };
    // use onclick instead of eventlistener to override prev
    $iconsTab.onclick = displayIconsTab;
    $emojiTab.onclick = displayEmojiTab;
    // otherwise both may be visible on reopen
    displayEmojiTab(true);

    async function setIcon(iconUrl) {
      // without this react gets upset
      displayEmojiTab();
      $linkTab.firstChild.click();
      await new Promise(requestAnimationFrame);

      // call native setter, imitate human input
      const $notionLinkInput = $mediaMenu.querySelector(mediaLinkInputSelector),
        proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      proto.set.call($notionLinkInput, iconUrl);
      const inputEvent = new Event('input', { bubbles: true }),
        enterKeydownEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          keyCode: 13,
        });
      $notionLinkInput.dispatchEvent(inputEvent);
      $notionLinkInput.dispatchEvent(enterKeydownEvent);
    }

    const submitLinkIcon = () => {
      const url = $iconsLinkInput.firstElementChild.value;
      setIcon(url);
      recentUploads.push({ signed: notion.sign(url, notion.getPageID()), url: url });
      db.set(['recent_uploads'], recentUploads);
    };
    $iconsLinkInput.onkeyup = (event) => {
      if (event.code === 13) submitLinkIcon();
    };
    $iconsLinkSubmit.onclick = submitLinkIcon;

    // upload file to aws, then submit link
    $iconsUploadSubmit.onclick = $iconsUploadFile.click;
    $iconsUploadFile.onchange = async (event) => {
      const file = event.target.files[0],
        url = await notion.upload(file);
      setIcon(url);
      recentUploads.push({ signed: notion.sign(url, notion.getPageID()), url: url });
      db.set(['recent_uploads'], recentUploads);
    };
  };
  web.addDocumentObserver(insertIconsTab, [mediaMenuSelector]);
}
