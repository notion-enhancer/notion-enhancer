/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const { twind, htm } = globalThis,
  { readFile } = globalThis.__enhancerApi;

let iconColour, iconMonochrome;
(async () => {
  iconColour = await readFile("/assets/colour.svg");
  iconMonochrome = await readFile("/assets/monochrome.svg");
})();

const kebabToPascalCase = (string) =>
    string[0].toUpperCase() +
    string.replace(/-[a-z]/g, (match) => match.slice(1).toUpperCase()).slice(1),
  hToString = (type, props, ...children) =>
    `<${type}${Object.entries(props)
      .map(([attr, value]) => ` ${attr}="${value}"`)
      .join("")}>${children
      .flat(Infinity)
      .map(([tag, attrs, children]) => hToString(tag, attrs, children))
      .join("")}</${type}>`;

// https://gist.github.com/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
const encodeSvg = (svg) =>
  svg
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

twind.install({
  rules: [
    [
      /^i-((?:\w|-)+)(?:\?(mask|bg|auto))?$/,
      ([, icon, mode]) => {
        let svg;
        // manually register i-notion-enhancer: renders the colour
        // version by default, renders the monochrome version when
        // mask mode is requested via i-notion-enhancer?mask
        if (icon === "notion-enhancer") {
          svg = mode === "mask" ? iconMonochrome : iconColour;
        } else {
          icon = kebabToPascalCase(icon);
          if (!globalThis.lucide[icon]) return;
          svg = hToString(...globalThis.lucide[icon]);
        }
        // https://antfu.me/posts/icons-in-pure-css
        const dataUri = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`;
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
  variants: [["open", "&[open]"]],
});

// construct elements via tagged tagged
// e.g. html`<div class=${className}></div>`
const h = (type, props, ...children) => {
    const elem = document.createElement(type);
    for (const prop in props) {
      if (["string", "number", "boolean"].includes(typeof props[prop])) {
        elem.setAttribute(prop, props[prop]);
      } else elem[prop] = props[prop];
    }
    for (const child of children) elem.append(child);
    return elem;
  },
  html = htm.bind(h);

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, { html });
