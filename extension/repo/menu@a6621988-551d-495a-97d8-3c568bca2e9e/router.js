/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web } from '../../api.js';

export const getSearch = () =>
  new Map(
    location.search
      .slice(1)
      .split('&')
      .map((query) => query.split('='))
  );

let defaultView = '';
const views = new Map(),
  filters = new Map();

export function setDefaultView(name) {
  defaultView = name;
}
export function addView(name, loader, filter = () => {}) {
  views.set(name, loader);
  filters.set(name, filter);
}
export function removeView(name) {
  views.delete(name);
  filters.delete(name);
}

function router(event) {
  event.preventDefault();
  const anchor = event.path.find((anchor) => anchor.nodeName === 'A');
  if (location.search !== anchor.getAttribute('href')) {
    window.history.pushState(
      { search: anchor.getAttribute('href'), hash: '' },
      '',
      anchor.href
    );
    load();
  }
}
function navigator(event) {
  event.preventDefault();
  const anchor = event.path.find((anchor) => anchor.nodeName === 'A'),
    hash = anchor.getAttribute('href').slice(1);
  document.getElementById(hash).scrollIntoView(true);
  document.documentElement.scrollTop = 0;
  history.replaceState({ search: location.search, hash }, null, `#${hash}`);
}

export async function load(force = false) {
  const $container = document.querySelector('main'),
    search = getSearch(),
    fallbackView = () =>
      window.history.replaceState(
        { search: `?view=${defaultView}`, hash: '' },
        null,
        `?view=${defaultView}`
      );
  if (force || !search.get('view') || document.body.dataset.view !== search.get('view')) {
    if (views.get(search.get('view'))) {
      const $body = await (views.get(search.get('view')) || (() => void 0))();
      if ($body) {
        $container.style.opacity = 0;
        await new Promise((res, rej) =>
          setTimeout(() => {
            document.body.dataset.view = search.get('view');
            $container.innerHTML = '';
            $container.append($body);
            requestAnimationFrame(() => {
              $container.style.opacity = '';
              setTimeout(res, 200);
            });
          }, 200)
        );
      } else return fallbackView();
    } else return fallbackView();
  }
  if (filters.get(search.get('view'))) filters.get(search.get('view'))(search);
}
window.addEventListener('popstate', (event) => {
  if (event.state) load();
  document.getElementById(location.hash.slice(1))?.scrollIntoView(true);
  document.documentElement.scrollTop = 0;
});
web.addDocumentObserver((mutation) => {
  mutation.target.querySelectorAll('a[href^="?"]').forEach((a) => {
    a.removeEventListener('click', router);
    a.addEventListener('click', router);
  });
  mutation.target.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.removeEventListener('click', navigator);
    a.addEventListener('click', navigator);
  });
});
