/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const registry = fetch(chrome.runtime.getURL('registry.json')).then((response) =>
  response.json()
);

const web = {};
web.whenReady = (func = () => {}) => {
  return new Promise((res, rej) => {
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState === 'complete') {
          func();
          res(true);
        }
      });
    } else {
      func();
      res(true);
    }
  });
};
web.createElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
};
web.loadStyleset = (sheet) => {
  document.head.appendChild(
    web.createElement(`<link rel="stylesheet" href="${chrome.runtime.getURL(sheet)}">`)
  );
  return true;
};

export { registry, web };
