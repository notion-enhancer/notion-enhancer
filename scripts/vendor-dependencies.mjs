/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dependencies = {
  "htm.min.js": "https://unpkg.com/htm@3.1.1/mini/index.js",
  "twind.min.js": "https://unpkg.com/@twind/cdn@1.0.8/cdn.global.js",
  "lucide.min.js": "https://unpkg.com/lucide@0.309.0/dist/umd/lucide.min.js",
  "coloris.min.js":
    "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@v0.22.0/dist/coloris.min.js",
  "coloris.min.css":
    "https://cdn.jsdelivr.net/gh/mdbassit/Coloris@v0.22.0/dist/coloris.min.css",
};

const output = fileURLToPath(new URL("../src/vendor", import.meta.url)),
  write = (file, data) => fsp.writeFile(resolve(`${output}/${file}`), data),
  append = (file, data) => fsp.appendFile(resolve(`${output}/${file}`), data);
if (existsSync(output)) await fsp.rm(output, { recursive: true });
await fsp.mkdir(output);
for (const file in dependencies) {
  const source = dependencies[file],
    res = await (await fetch(source)).text();
  await write(file, res);
}

// expose vendored twind cdn
await append("twind.min.js", `\n;globalThis.twind = twind;`);

// build content type lookup script from mime-db to avoid
// re-processing entire the database every time a file is
// requested via notion://www.notion.so/__notion-enhancer/
let contentTypes = [];
for (const [type, { extensions, charset }] of Object.entries(
  await (await fetch("https://unpkg.com/mime-db@1.52.0/db.json")).json()
)) {
  if (!extensions) continue;
  const contentType = charset
    ? `${type}; charset=${charset.toLowerCase()}`
    : type;
  for (const ext of extensions) contentTypes.push([ext, contentType]);
}
contentTypes = `module.exports=new Map(${JSON.stringify(contentTypes)});`;
await write("content-types.min.js", contentTypes);
