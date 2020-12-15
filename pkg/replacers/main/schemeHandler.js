/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

import fsp from 'fs/promises';

export default async function (file) {
  // https://github.com/notion-enhancer/notion-enhancer/issues/160
  // enable the notion:// url scheme/protocol on linux
  const contents = await fsp.readFile(file, 'utf8');
  await fsp.writeFile(
    file,
    contents.replace(
      /registerStreamProtocol\(config_1\.default\.protocol, async \(req, callback\) => {/,
      `registerStreamProtocol(config_1.default.protocol, async (req, callback) => {
      if (req.url.startsWith('notion://enhancer/')) {
        const { enhancements } = require('notion-enhancer/helpers'),
          query = req.url.replace(/^notion:\\/\\/enhancer\\//, '').split('/'),
          mod = enhancements.get(query.shift());
        if (mod && !mod.error) {
          callback(
            fs.createReadStream(
              require('path').resolve(\`\${mod.source}/\${query.join('/')}\`)
            )
          );
          return;
        }
      }`
    )
  );
  return true;
}
