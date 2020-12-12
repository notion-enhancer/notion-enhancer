/*
 * helper.js from admiraldus
 * (c) 2020 admiraldus (https://github.com/admiraldus)
 * use for your own modules but you have to attribute to me.
 * under the MIT license
 */

'use strict';

const PATH = require('path');
const FS = require('fs-extra');

var x$ = {
  sel: function(els, mode = false, base = null) {
    base = base === null ? document : base;
    return mode ? base.querySelectorAll(els) : base.querySelector(els);
  },

  cls: {
    r: function(els, cls, mode = false, base = null) {
      base = base === null ? document : base;
      mode ? x$.sel(els, true).forEach((el) =>
        el.classList.remove(cls)) : els.classList.remove(cls);
    },

    a: function(els, cls, mode = false, base = null) {
      base = base === null ? document : base;
      mode ? x$.sel(els, true).forEach((el) =>
        el.classList.add(cls)) : els.classList.add(cls);
    },

    c: function(els, cls, mode = false, base = null) {
      base = base === null ? document : base;
      return mode ? x$.sel(els, true).forEach((el) =>
        el.classList.contains(cls)) : els.classList.contains(cls);
    },
  },

  svg: function(path) {
    return FS.readFile(PATH.resolve(__dirname + path));
  },

  on: function(base, event, fn, flag = false) {
    base.addEventListener(event, fn, flag);
  },

  sim: function(events, els) {
    events.forEach((event) => els.dispatchEvent(
        new MouseEvent(event, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        })));
  },

  obs: function(fn, els, config) {
    const observer = new MutationObserver(fn);
    observer.observe(els, config);
  },

  clp: function(mode = true, value) {
    switch (mode) {
      case false:
        navigator.clipboard.writeText(value);
        break;
      case true:
        return navigator.clipboard.readText();
        break;
    }
  },

  el: function(html) {
    const temp = document.createElement('template');
    temp.innerHTML = html.trim();
    return temp.content.firstElementChild;
  },
};

module.exports = {
  x$,
};
