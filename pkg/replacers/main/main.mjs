/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import fsp from 'fs/promises';

export default async function (filepath) {
  // https://github.com/notion-enhancer/desktop/issues/160
  // enable the notion:// url scheme/protocol on linux
  const contents = await fsp.readFile(filepath, 'utf8');
  await fsp.writeFile(
    filepath,
    contents.replace(
      /process.platform === "win32"/g,
      'process.platform === "win32" || process.platform === "linux"'
    )
  );
  return true;
}
