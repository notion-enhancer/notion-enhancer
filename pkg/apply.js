/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';
const os = require('os'),
  fs = require('fs-extra'),
  path = require('path'),
  exec = require('util').promisify(require('child_process').exec),
  helpers = require('./helpers.js'),
  store = require('./store.js');

let __notion = helpers.getNotion();

module.exports = async function () {
  const data = store('test', { ok: true });
  console.log(data.ok);
  data.thing = 7;
  console.log(data);
};

// getNotion()
//   .then(async (__notion) => {
//     console.log(__notion);
//     await exec(
//       `"${__dirname}/node_modules/asar/bin/asar.js" extract "${__notion}/app.asar" "${__notion}/app"`
//     );
//   })
//   .catch((err) => console.log(err.message));
