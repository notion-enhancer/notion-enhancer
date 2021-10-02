/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web } from '../../api/_.mjs';

let _defaultView = '';
const _views = new Map();

export function addView(name, loadFunc) {
  _views.set(name, loadFunc);
}
export function removeView(name) {
  _views.delete(name);
}

function router(event) {
  event.preventDefault();
  const anchor = event.path
    ? event.path.find((anchor) => anchor.nodeName === 'A')
    : event.target;
  if (location.search !== anchor.getAttribute('href')) {
    window.history.pushState(null, null, anchor.href);
    loadView();
  }
}
function navigator(event) {
  event.preventDefault();
  const anchor = event.path
      ? event.path.find((anchor) => anchor.nodeName === 'A')
      : event.target,
    hash = anchor.getAttribute('href').slice(1);
  document.getElementById(hash).scrollIntoView(true);
  document.documentElement.scrollTop = 0;
  history.replaceState({ search: location.search, hash }, null, `#${hash}`);
}

export async function loadView(defaultView = null) {
  if (defaultView) _defaultView = defaultView;
  if (!_defaultView) throw new Error('no view root set.');

  const query = web.queryParams(),
    fallbackView = () => {
      window.history.replaceState(null, null, `?view=${_defaultView}`);
      return loadView();
    };
  if (!query.get('view') || document.body.dataset.view !== query.get('view')) {
    if (_views.get(query.get('view'))) {
      await _views.get(query.get('view'))();
    } else return fallbackView();
  } else return fallbackView();
}

window.addEventListener('popstate', (event) => {
  if (event.state) loadView();
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
