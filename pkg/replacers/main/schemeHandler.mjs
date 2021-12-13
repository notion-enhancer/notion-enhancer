/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import fsp from 'fs/promises';

export default async function (filepath) {
  // https://github.com/notion-enhancer/desktop/issues/291
  // bypass csp issues by intercepting notion:// protocol
  const contents = await fsp.readFile(filepath, 'utf8');
  await fsp.writeFile(
    filepath,
    contents.replace(
      /const success = protocol\.registerStreamProtocol\(config_1.default.protocol, async \(req, callback\) => \{/,
      `const success = protocol.registerStreamProtocol(config_1.default.protocol, async (req, callback) => {
      {
        // notion-enhancer
        const schemePrefix = 'notion://www.notion.so/__notion-enhancer/';
        if (req.url.startsWith(schemePrefix)) {
          const { search, hash, pathname } = new URL(req.url),
            resolvePath = (path) => require('path').resolve(\`\${__dirname}/\${path}\`),
            fileExt = pathname.split('.').reverse()[0],
            mimeDB = Object.entries(require('notion-enhancer/dep/mime-db.json')),
            mimeType = mimeDB
              .filter(([mime, data]) => data.extensions)
              .find(([mime, data]) => data.extensions.includes(fileExt));
          let filePath = '../node_modules/notion-enhancer/';
          filePath += req.url.slice(schemePrefix.length);
          if (search) filePath = filePath.slice(0, -search.length);
          if (hash) filePath = filePath.slice(0, -hash.length);
          callback({
            data: require('fs').createReadStream(resolvePath(filePath)),
            headers: { 'content-type': mimeType },
          });
        }
      }`
    )
  );

  return true;
}
