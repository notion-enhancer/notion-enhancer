/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import fsp from 'fs/promises';

export default async function (filepath) {
  // so that e.g. tabs access and modify the template
  const contents = await fsp.readFile(filepath, 'utf8');
  await fsp.writeFile(
    filepath,
    contents.replace(
      /\}\nexports\.setupSystemMenu = setupSystemMenu;/g,
      'return template;}\nexports.setupSystemMenu = setupSystemMenu;'
    )
  );
  return true;
}
