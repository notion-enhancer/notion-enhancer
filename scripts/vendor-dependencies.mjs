/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const esmVersion = "135",
  esTarget = "es2022",
  esmBundle = ({ name, version, path = "", exports = [] }) => {
    const scopedName = name;
    if (name.startsWith("@")) name = name.split("/")[1];
    path ||= `${name}.bundle.mjs`;
    let bundleSrc = `https://esm.sh/v${esmVersion}/${scopedName}@${version}/${esTarget}/${path}`;
    if (exports.length) bundleSrc += `?bundle&exports=${exports.join()}`;
    return { [`${scopedName.replace(/\//g, "-")}.mjs`]: bundleSrc };
  };

const dependencies = {
  ...esmBundle({ name: "htm", version: "3.1.1" }),
  ...esmBundle({
    name: "lucide",
    version: "0.319.0",
    path: "dist/umd/lucide.mjs",
  }),
  ...esmBundle({
    name: "@unocss/core",
    version: "0.58.5",
    exports: ["createGenerator", "expandVariantGroup"],
  }),
  ...esmBundle({
    name: "@unocss/preset-uno",
    version: "0.58.5",
    exports: ["presetUno"],
  }),
  "@unocss-preflight-tailwind.css":
    "https://esm.sh/@unocss/reset@0.58.5/tailwind.css",
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
