/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dependencies = [
  ["twind.min.js", "https://cdn.twind.style"],
  ["lucide.min.js", "https://unpkg.com/lucide@0.104.0/dist/umd/lucide.min.js"],
  ["jscolor.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js"],
];

const output = fileURLToPath(new URL("../src/vendor", import.meta.url));
if (existsSync(output)) await fsp.rm(output, { recursive: true });
await fsp.mkdir(output);
for (const [file, source] of dependencies) {
  const res = await (await fetch(source)).text();
  await fsp.writeFile(resolve(`${output}/${file}`), res);
}

// build content type lookup script from mime-db to avoid
// re-processing entire the database every time a file is
// requested via notion://www.notion.so/__notion-enhancer/
const mimeTypes = await (await fetch("https://unpkg.com/mime-db@1.52.0/db.json")).json(),
  contentTypes = [];
for (const [type, { extensions, charset }] of Object.entries(mimeTypes)) {
  if (!extensions) continue;
  const contentType = charset ? `${type}; charset=${charset.toLowerCase()}` : type;
  for (const ext of extensions) contentTypes.push([ext, contentType]);
}
const encodedContentTypes = `module.exports=new Map(${JSON.stringify(contentTypes)});`;
await fsp.writeFile(resolve(`${output}/content-types.min.js`), encodedContentTypes);
