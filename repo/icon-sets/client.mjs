/*
 * notion-enhancer: icon sets
 * (c) 2019 jayhxmo (https://jaymo.io/)
 * (c) 2020 CloudHill <rl.cloudhill@gmail.com> (https://github.com/CloudHill)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const getImgData = (url) =>
  new Promise(async (res, rej) => {
    const blob = await fetch(url).then((res) => res.blob()),
      reader = new FileReader();
    reader.onload = (e) => res(e.target.result);
    reader.readAsDataURL(blob);
  });

export default async function ({ web, fs, components, notion }, db) {
  const recentUploads = await db.get(['recent_uploads'], []),
    preventQualityReduction = await db.get(['prevent_quality_reduction']),
    $triangleSvg = web.html`<svg viewBox="0 0 100 100" class="triangle">
      <polygon points="5.9,88.2 50,11.8 94.1,88.2" />
    </svg>`;

  const customIconSets = [],
    customIconsFile = await db.get(['json']);
  if (customIconsFile?.content) {
    const iconsData = JSON.parse(customIconsFile.content);
    customIconSets.push(...(iconsData.icons || iconsData));
  }

  const enhancerIconSets = [],
    enhancerIconsUrl = 'https://raw.githubusercontent.com/notion-enhancer/icons/main/';
  if (await db.get(['default_sets'])) {
    const iconsData = await fs.getJSON(`${enhancerIconsUrl}/icons.json`);
    enhancerIconSets.push(...(iconsData.icons || iconsData));
  }

  const mediaMenuSelector = '.notion-media-menu',
    mediaScrollerSelector = '.notion-media-menu > .notion-scroller',
    mediaFilterSelector = '.notion-media-menu > :first-child > :last-child',
    mediaLinkInputSelector = '.notion-focusable-within > input[type=url]',
    tabBtnSelector = (n) =>
      `.notion-media-menu > :first-child > :first-child > :nth-child(${n})`;

  const renderSetTitle = async (title, loadPromises = [], $tooltip = undefined) => {
    const isCollapsed = await db.get(['collapsed', title], false),
      $title = web.html`<p class="icon_sets--title"
            ${isCollapsed ? 'data-collapsed="true"' : ''}></p>`,
      $spinner = web.html`<span class="icon_sets--spinner">
        <img src="/images/loading-spinner.4dc19970.svg" />
      </span>`;
    web.render(
      $title,
      $triangleSvg.cloneNode(true),
      web.html`<span>${title}</span>`,
      $spinner
    );
    $title.addEventListener('click', () => {
      const newState = $title.dataset.collapsed !== 'true';
      db.set(['collapsed', title], newState);
      $title.dataset.collapsed = newState;
    });
    // hide spinner after all icons finish loading
    // doesn't need to be waited on by renderers
    (async () => {
      await Promise.all(loadPromises);
      $spinner.remove();
      if ($tooltip) {
        const $infoSvg = web.html`${await components.feather('info', { class: 'info' })}`;
        components.setTooltip($infoSvg, $tooltip);
        web.render($title, $infoSvg);
      }
    })();
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
    // container
    $iconsView = web.render(
      web.html`<div class="icon_sets--view" style="display:none"></div>`,
      web.render(
        web.html`<div class="icon_sets--actions"></div>`,
        web.render(
          web.html`<div class="notion-focusable-within" style="display:flex;border-radius:3px;"></div>`,
          $iconsLinkInput,
          $iconsLinkSubmit
        ),
        $iconsUploadSubmit
      ),
      web.render($setsList)
    );

  let $mediaMenu, $activeTabUnderline;
  const insertIconsTab = async () => {
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
    $emojiScroller.after($iconsView);

    const renderRecentUploads = async () => {
        const $recentUploads = web.html`<div class="icon_sets--set"></div>`,
          loadPromises = [];
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
            } else setIcon({ signed, url });
          });
          loadPromises.push(
            new Promise((res, rej) => {
              $icon.firstElementChild.onload = res;
              $icon.firstElementChild.onerror = res;
            })
          );
        }

        const $recentUploadsTitle = await renderSetTitle(
          'Recent',
          loadPromises,
          web.html`<p><b>Click</b> to reuse an icon <br><b>Shift-click</b> to remove it</p>`
        );
        web.render($setsList, $recentUploadsTitle, $recentUploads);
      },
      renderIconSet = async (iconData, enhancerSet = false) => {
        try {
          const $set = web.html`<div class="icon_sets--set"></div>`;
          if (iconData.sourceUrl?.endsWith?.('/')) {
            iconData.sourceUrl = iconData.sourceUrl.slice(0, -1);
          }

          const loadPromises = [];
          for (let i = 0; i < (iconData.count || iconData.source.length); i++) {
            const iconUrl = iconData.sourceUrl
                ? Array.isArray(iconData.source)
                  ? `${iconData.sourceUrl}/${iconData.source[i]}.${iconData.extension}`
                  : `${iconData.sourceUrl}/${iconData.source}_${i}.${iconData.extension}`
                : iconData.source[i],
              sprite = enhancerSet
                ? `style="
                    background-image: url(${enhancerIconsUrl}${iconData.source}/sprite.png);
                    background-position: 0 -${i * 24}px;
                  "`
                : '',
              $img = sprite
                ? web.html`<div class="icon_sets--sprite" ${sprite}></div>`
                : web.html`<img src="${web.escape(iconUrl)}">`,
              $icon = web.render(web.html`<span class="icon_sets--icon"></span>`, $img);
            web.render($set, $icon);
            $icon.addEventListener('click', (event) => {
              if (!event.shiftKey) setIcon({ signed: iconUrl, url: iconUrl });
            });
            if (!sprite) {
              loadPromises.push(
                new Promise((res, rej) => {
                  $img.onload = res;
                  $img.onerror = res;
                })
              );
            }
          }

          const author = iconData.author
              ? iconData.authorUrl
                ? web.raw`by <a target="_blank" href="${web.escape(iconData.authorUrl)}">
                  ${iconData.author}
                </a>`
                : web.raw`by ${web.escape(iconData.author)}`
              : '',
            $title = await renderSetTitle(
              `${web.escape(iconData.name)} ${author}`,
              loadPromises
            );
          web.render($setsList, $title, $set);
        } catch (err) {
          console.log(err);
          web.render(
            $setsList,
            web.html`<div class="icon_sets--error">
              Invalid set: ${web.escape(iconData?.name || 'Unknown')}
            </div>`
          );
        }
      },
      renderCustomIconSets = async () => {
        if (customIconSets.length) {
          web.render($setsList, web.html`<div class="icon_sets--divider"></div>`);
        }
        await Promise.all(customIconSets.map((set) => renderIconSet(set)));
      },
      renderEnhancerIconSets = async () => {
        if (enhancerIconSets.length) {
          web.render($setsList, web.html`<div class="icon_sets--divider"></div>`);
        }
        await Promise.all(
          enhancerIconSets.map((set) => {
            set.sourceUrl = set.sourceUrl || enhancerIconsUrl + set.source;
            return renderIconSet(set, true);
          })
        );
      };

    const displayIconsTab = async (force = false) => {
        if ($iconsTab.contains($activeTabUnderline) && !force) return;
        web.render($iconsTab, $activeTabUnderline);
        $iconsView.style.display = '';
        $emojiScroller.style.display = 'none';
        $emojiFilter.style.display = 'none';
        web.empty($setsList);
        await renderRecentUploads();
        await renderCustomIconSets();
        await renderEnhancerIconSets();
        $iconsView.querySelectorAll('.icon_sets--set').forEach(($set) => {
          $set.style.height = `${$set.scrollHeight}px`;
        });
      },
      displayEmojiTab = (force = false) => {
        if ($emojiTab.contains($activeTabUnderline) && !force) return;
        web.render($emojiTab, $activeTabUnderline);
        $iconsView.style.display = 'none';
        $emojiScroller.style.display = '';
        $emojiFilter.style.display = '';
      };
    // use onclick instead of eventlistener to override prev
    $iconsTab.onclick = displayIconsTab;
    $emojiTab.onclick = displayEmojiTab;
    // otherwise both may be visible on reopen
    displayEmojiTab(true);

    async function setIcon({ signed, url }) {
      // without this react gets upset
      displayEmojiTab();
      $linkTab.firstChild.click();
      await new Promise(requestAnimationFrame);

      $mediaMenu.parentElement.style.opacity = '0';
      const iconUrl = preventQualityReduction ? await getImgData(signed) : url;

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
      if (!url) return;
      const icon = { signed: notion.sign(url, notion.getPageID()), url: url };
      setIcon(icon);
      recentUploads.push(icon);
      db.set(['recent_uploads'], recentUploads);
    };
    $iconsLinkInput.onkeyup = (event) => {
      if (event.code === 13) submitLinkIcon();
    };
    $iconsLinkSubmit.onclick = submitLinkIcon;

    // upload file to aws, then submit link
    $iconsUploadSubmit.onclick = () => $iconsUploadFile.click();
    $iconsUploadFile.onchange = async (event) => {
      const file = event.target.files[0],
        url = await notion.upload(file),
        icon = { signed: notion.sign(url, notion.getPageID()), url: url };
      setIcon(icon);
      recentUploads.push(icon);
      db.set(['recent_uploads'], recentUploads);
    };
  };
  web.addDocumentObserver(insertIconsTab, [mediaMenuSelector]);
}
