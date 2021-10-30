// source => icon data
const enhancerIconSets = new Map();
getAsync(notionIconsUrl + 'icons.json', (iconsData) => {
  const data = JSON.parse(iconsData);
  (data.icons || data).forEach((set) => {
    enhancerIconSets.set(set.source, set);
  });
});

// array
let customIconSets;
if (store().json) {
  const customData = JSON.parse(fs.readFileSync(store().json));
  customIconSets = customData.icons || customData;
}

// convert icons data into renderable
function loadIconSets() {
  const iconSets = new DocumentFragment();

  if (customIconSets) {
    customIconSets.forEach((i) => {
      iconSets.appendChild(renderIconSet(i));
    });

    // divider
    iconSets.appendChild(createElement('<div class="notion-icons--divider"></div>'));
  }

  if (enhancerIconSets.size > 0) {
    enhancerIconSets.forEach((i, source) => {
      // ignore removed icon sets
      if (store().removedSets?.includes(source)) return;

      i.sourceUrl = i.sourceUrl || notionIconsUrl + source;
      iconSets.appendChild(renderIconSet(i, true));
    });
  }

  return iconSets;
}

// returns icon set element
function renderIconSet(iconData, enhancerSet = false) {
  const iconSet = createElement('<div class="notion-icons--icon-set"></div>');

  try {
    const author = iconData.author
      ? iconData.authorUrl
        ? ` by <a target="_blank" href="${iconData.authorUrl}">${iconData.author}</a>`
        : ` by <span>${iconData.author}</span>`
      : '';

    const toggle = createElement(`
            <div class="notion-icons--toggle">
              ${menuIcons.triangle}
              <div class="notion-icons--author">${iconData.name}${author}</div>
              <div class="notion-icons--actions">
                <div class="notion-icons--spinner">
                  <img src="/images/loading-spinner.4dc19970.svg" />
                </div>
              </div>
            </div>
          `);

    const iconSetBody = createElement('<div class="notion-icons--body"></div>');

    iconSet.append(toggle, iconSetBody);

    const promiseArray = [];
    // render icons
    for (let i = 0; i < (iconData.count || iconData.source.length); i++) {
      const iconUrl = iconData.sourceUrl
        ? Array.isArray(iconData.source)
          ? `${iconData.sourceUrl}/${iconData.source[i]}.${iconData.extension}`
          : `${iconData.sourceUrl}/${iconData.source}_${i}.${iconData.extension}`
        : iconData.source[i];

      const icon = createElement(`<div class="notion-icons--icon"></div>`);
      icon.innerHTML = enhancerSet
        ? // load sprite sheet
          `<div style="background-image: url(${notionIconsUrl}${
            iconData.source
          }/sprite.png); background-position: 0 -${i * 32}px;"></div>`
        : `<img src="${iconUrl}" />`;

      // add filters to filterMap
      const filters = [];

      if (iconData.filter) {
        if (iconData.filter === 'source') {
          const filename = iconUrl.match(/.*\/(.+?)\./);
          if (filename?.length > 1) {
            filters.push(...filename[1].split(/[ \-_]/));
          }
        } else if (Array.isArray(iconData.filter)) {
          filters.push(...iconData.filter[i]);
        }
        icon.setAttribute('filter', filters.join(' '));
      }

      // add set name and author to filters
      filters.push(...iconData.name.toLowerCase().split(' '));
      if (iconData.author) filters.push(...iconData.author.toLowerCase().split(' '));

      filterMap.set(icon, filters);

      // make sure icons load
      if (!enhancerSet) {
        promiseArray.push(
          new Promise((resolve, reject) => {
            icon.firstChild.onload = resolve;
            icon.firstChild.onerror = () => {
              reject();
              icon.classList.add('error');
              icon.innerHTML = '!';
            };
          })
        );
      }

      garbageCollector.push(icon);
      icon.addEventListener('click', () => setPageIcon(iconUrl));
      iconSetBody.appendChild(icon);
    }

    // hide spinner after all icons finish loading
    (async () => {
      const spinner = toggle.querySelector('.notion-icons--spinner'),
        loadPromise = Promise.all(promiseArray);
      loadPromise.then(
        () => spinner.remove(),
        () => {
          iconSet.classList.add('alert');
          spinner.remove();
        }
      );
    })();

    // add remove icon set button
    if (enhancerSet) {
      const removeButton = createElement(
        `<div class="notion-icons--remove-button">${menuIcons.remove}</div>`
      );
      removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        removeIconSet(iconData);
      });
      iconSet.querySelector('.notion-icons--actions').appendChild(removeButton);
    }

    // set up toggle
    toggle.addEventListener('click', (e) => {
      if (e.target.nodeName === 'A') return;
      toggleIconSet(iconSet);
    });

    // hide by default?
    if (store().hide) requestAnimationFrame(() => toggleIconSet(iconSet));

    // tooltip
    let timeout;
    iconSetBody.addEventListener('mouseover', (e) => {
      const el = e.target;
      if (!el.hasAttribute('filter')) return;

      document.querySelector('.notion-icons--tooltip')?.remove();
      timeout = setTimeout(() => {
        renderTooltip(el, el.getAttribute('filter'));
      }, 300);
    });
    iconSetBody.addEventListener('mouseout', (e) => {
      const el = e.target;
      if (!el.hasAttribute('filter')) return;

      document.querySelector('.notion-icons--tooltip')?.remove();
      clearTimeout(timeout);
    });
  } catch (err) {
    iconSet.classList.add('error');
    iconSet.innerHTML = `Invalid Icon Set: ${iconData.name}`;
  }

  return iconSet;
}
