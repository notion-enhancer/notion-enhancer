/*
 * notion-enhancer core: menu
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { web } from '../../api/_.mjs';

const _queryListeners = new Set();

export function addView(name, loadFunc) {
  const handlerFunc = (newView) => {
    if (newView === name) return loadFunc();
    return false;
  };
  _queryListeners.add({ param: 'view', viewName: name, handlerFunc });
  handlerFunc(web.queryParams().get('view'), null);
}
export function removeView(name) {
  const view = [..._queryListeners].find((view) => view.viewName === name);
  if (view) _queryListeners.delete(view);
}
export async function setDefaultView(viewName) {
  const viewList = [..._queryListeners].filter((q) => q.viewName).map((v) => v.viewName);
  if (!viewList.includes(web.queryParams().get('view'))) {
    updateQuery(`?view=${viewName}`, true);
  }
}

export function addQueryListener(param, handlerFunc) {
  _queryListeners.add({ param: param, handlerFunc });
  handlerFunc(web.queryParams().get(param), null);
}
export function removeQueryListener(handlerFunc) {
  const listener = [..._queryListeners].find((view) => view.handlerFunc === handlerFunc);
  if (listener) _queryListeners.delete(listener);
}

export const updateQuery = (search, replace = false) => {
  let query = web.queryParams();
  for (const [key, val] of new URLSearchParams(search)) {
    query.set(key, val);
  }
  query = `?${query.toString()}`;
  if (location.search !== query) {
    if (replace) {
      window.history.replaceState(null, null, query);
    } else {
      window.history.pushState(null, null, query);
    }
    triggerQueryListeners();
  }
};

function router(event) {
  event.preventDefault();
  const anchor = event.path
    ? event.path.find((anchor) => anchor.nodeName === 'A')
    : event.target;
  updateQuery(anchor.getAttribute('href'));
}

let queryCache = '';
async function triggerQueryListeners() {
  if (location.search === queryCache) return;
  const newQuery = web.queryParams(),
    oldQuery = new URLSearchParams(queryCache);
  queryCache = location.search;
  for (const listener of _queryListeners) {
    const newParam = newQuery.get(listener.param),
      oldParam = oldQuery.get(listener.param);
    if (newParam !== oldParam) listener.handlerFunc(newParam, oldParam);
  }
}

window.addEventListener('popstate', triggerQueryListeners);

web.addDocumentObserver(
  (mutation) => {
    mutation.target.querySelectorAll('a[href^="?"]').forEach((a) => {
      a.removeEventListener('click', router);
      a.addEventListener('click', router);
    });
  },
  ['a[href^="?"]']
);
