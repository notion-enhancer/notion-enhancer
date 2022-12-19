/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dependencies = {
  "twind.min.js": "https://cdn.twind.style",
  "lucide.min.js": "https://unpkg.com/lucide@0.104.0/dist/umd/lucide.min.js",
  "htm+preact.min.js":
    "https://unpkg.com/htm@3.1.1/preact/standalone.module.js",
  "jscolor.min.js":
    "https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js",
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
