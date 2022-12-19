/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import "../vendor/twind.min.js";
import "../vendor/lucide.min.js";
import { html, render } from "../vendor/htm+preact.min.js";

const { readFile } = globalThis.__enhancerApi,
  enhancerIcon = await readFile("/media/colour.svg"),
  enhancerIconMonochrome = await readFile("/media/monochrome.svg");

const kebekToPascalCase = (string) =>
    string[0].toUpperCase() +
    string.replace(/-[a-z]/g, (match) => match.slice(1).toUpperCase()).slice(1),
  hToString = (tag, attrs, children = []) =>
    `<${tag}${Object.entries(attrs)
      .map(([attr, value]) => ` ${attr}="${value}"`)
      .join("")}>${children
      .map(([tag, attrs, children]) => hToString(tag, attrs, children))
      .join("")}</${tag}>`;

// https://gist.github.com/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
const encodeSvg = (svg) => {
  return svg
    .replace(
      "<svg",
      ~svg.indexOf("xmlns") ? "<svg" : '<svg xmlns="http://www.w3.org/2000/svg"'
    )
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ");
};

// https://antfu.me/posts/icons-in-pure-css
const presetIcons = () => ({
  rules: [
    [
      /^i-((?:\w|-)+)(?:\?(mask|bg|auto))?$/,
      ([, icon, mode]) => {
        let svg;
        // manually register i-notion-enhancer: renders the colour
        // version by default, renders the monochrome version when
        // mask mode is requested via i-notion-enhancer?mask
        if (icon === "notion-enhancer") {
          svg = mode === "mask" ? enhancerIconMonochrome : enhancerIcon;
        } else {
          icon = kebekToPascalCase(icon);
          if (!globalThis.lucide[icon]) return;
          svg = hToString(...globalThis.lucide[icon]);
        }
        const dataUri = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`;
        console.log(dataUri);
        if (mode === "auto") mode = undefined;
        mode ??= svg.includes("currentColor") ? "mask" : "bg";
        return mode === "mask"
          ? {
              mask: `${dataUri} no-repeat`,
              "mask-size": "100% 100%",
              "background-color": "currentColor",
              color: "inherit",
              height: "1em",
              width: "1em",
            }
          : {
              background: `${dataUri} no-repeat`,
              "background-size": "100% 100%",
              "background-color": "transparent",
              height: "1em",
              width: "1em",
            };
      },
    ],
  ],
});
globalThis.twind.install({ presets: [presetIcons()] });

// by default, preact doesn't work nicely with existing dom nodes
// not introduced via preact: this appends a preact component to an
// element without overwriting its existing children
const append = (component, target) => {
  if (typeof target === "string") target = document.querySelector(target);
  if (!target) return false;
  const fragment = new DocumentFragment();
  render(component, fragment);
  target.append(fragment);
  return true;
};

export { html, append };
