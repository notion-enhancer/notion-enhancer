/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
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
      .map((child) => (Array.isArray(child) ? hToString(...child) : child))
      .join("")}</${type}>`;

const encodeSvg = (svg) =>
    // https://gist.github.com/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
    svg
      .replace(
        "<svg",
        ~svg.indexOf("xmlns")
          ? "<svg"
          : '<svg xmlns="http://www.w3.org/2000/svg"'
      )
      .replace(/"/g, "'")
      .replace(/%/g, "%25")
      .replace(/#/g, "%23")
      .replace(/{/g, "%7B")
      .replace(/}/g, "%7D")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
      .replace(/\s+/g, " "),
  presetIcons = ([, icon, mode]) => {
    let svg;
    // manually register i-notion-enhancer: renders the colour
    // version by default, renders the monochrome version when
    // mask mode is requested via i-notion-enhancer?mask
    if (icon === "notion-enhancer") {
      svg = mode === "mask" ? iconMonochrome : iconColour;
    } else {
      icon = kebabToPascalCase(icon);
      if (!globalThis.lucide[icon]) return;
      const [type, props, children] = globalThis.lucide[icon];
      svg = hToString(type, props, ...children);
    }
    // https://antfu.me/posts/icons-in-pure-css
    const dataUri = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`;
    if (mode === "auto") mode = undefined;
    mode ??= svg.includes("currentColor") ? "mask" : "bg";
    return {
      display: "inline-block",
      height: "1em",
      width: "1em",
      ...(mode === "mask"
        ? {
            mask: `${dataUri} no-repeat`,
            "mask-size": "100% 100%",
            "background-color": "currentColor",
            color: "inherit",
          }
        : {
            background: `${dataUri} no-repeat`,
            "background-size": "100% 100%",
            "background-color": "transparent",
          }),
    };
  };
twind.install({
  rules: [[/^i-((?:\w|-)+)(?:\?(mask|bg|auto))?$/, presetIcons]],
  variants: [
    // https://github.com/tw-in-js/twind/blob/main/packages/preset-ext/src/variants.ts
    [
      "not-([a-z-]+|\\[.+\\])",
      ({ 1: $1 }) => `&:not(${($1[0] == "[" ? "" : ":") + $1})`,
    ],
    ["children", "&>*"],
    ["siblings", "&~*"],
    ["sibling", "&+*"],
    ["override", "&&"],
    ["\\[.+]", (match) => "&" + match.input],
    ["([a-z-]+):", ({ 1: $1 }) => "&::" + $1],
  ],
});

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const svgElements = [
    "animate",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "defs",
    "desc",
    "discard",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "foreignObject",
    "g",
    "hatch",
    "hatchpath",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "script",
    "set",
    "stop",
    "style",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tspan",
    "use",
    "view",
  ],
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
  htmlAttributes = [
    "accept",
    "accept-charset",
    "accesskey",
    "action",
    "align",
    "allow",
    "alt",
    "async",
    "autocapitalize",
    "autocomplete",
    "autofocus",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "buffered",
    "capture",
    "challenge",
    "charset",
    "checked",
    "cite",
    "class",
    "code",
    "codebase",
    "color",
    "cols",
    "colspan",
    "content",
    "contenteditable",
    "contextmenu",
    "controls",
    "coords",
    "crossorigin",
    "csp",
    "data",
    "data-*",
    "datetime",
    "decoding",
    "default",
    "defer",
    "dir",
    "dirname",
    "disabled",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "for",
    "form",
    "formaction",
    "formenctype",
    "formmethod",
    "formnovalidate",
    "formtarget",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "http-equiv",
    "icon",
    "id",
    "importance",
    "integrity",
    "inputmode",
    "ismap",
    "itemprop",
    "keytype",
    "kind",
    "label",
    "lang",
    "loading",
    "list",
    "loop",
    "low",
    "max",
    "maxlength",
    "minlength",
    "media",
    "method",
    "min",
    "multiple",
    "muted",
    "name",
    "novalidate",
    "open",
    "optimum",
    "pattern",
    "ping",
    "placeholder",
    "playsinline",
    "poster",
    "preload",
    "radiogroup",
    "readonly",
    "referrerpolicy",
    "rel",
    "required",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "sandbox",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "spellcheck",
    "src",
    "srcdoc",
    "srclang",
    "srcset",
    "start",
    "step",
    "style",
    "tabindex",
    "target",
    "title",
    "translate",
    "type",
    "usemap",
    "value",
    "width",
    "wrap",
  ];
// html`<div class=${className}></div>`
const h = (type, props, ...children) => {
    children = children.flat(Infinity);
    // html`<${Component} attr="value">Click Me<//>`
    if (typeof type === "function") {
      return type(props ?? {}, ...children);
    }
    const elem = svgElements.includes(type)
      ? document.createElementNS("http://www.w3.org/2000/svg", type)
      : document.createElement(type);
    for (const prop in props ?? {}) {
      if (htmlAttributes.includes(prop)) {
        elem.setAttribute(prop, props[prop]);
      } else elem[prop] = props[prop];
    }
    elem.append(...children);
    return elem;
  },
  html = htm.bind(h);

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, { html });
