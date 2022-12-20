/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const kebabToPascalCase = (string) =>
    string[0].toUpperCase() +
    string.replace(/-[a-z]/g, (match) => match.slice(1).toUpperCase()).slice(1),
  camelToSentenceCase = (string) =>
    string[0].toUpperCase() +
    string.replace(/[A-Z]/g, (match) => " " + match.toLowerCase()).slice(1);

const hToString = (type, props, ...children) =>
  `<${type}${Object.entries(props)
    .map(([attr, value]) => ` ${attr}="${value}"`)
    .join("")}>${children
    .flat(Infinity)
    .map(([tag, attrs, children]) => hToString(tag, attrs, children))
    .join("")}</${type}>`;

// /**
//  * log-based shading of an rgb color, from
//  * https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
//  * @param {number} shade - a decimal amount to shade the color.
//  * 1 = white, 0 = the original color, -1 = black
//  * @param {string} color - the rgb color
//  * @returns {string} the shaded color
//  */
// export const rgbLogShade = (shade, color) => {
//   const int = parseInt,
//     round = Math.round,
//     [a, b, c, d] = color.split(","),
//     t = shade < 0 ? 0 : shade * 255 ** 2,
//     p = shade < 0 ? 1 + shade : 1 - shade;
//   return (
//     "rgb" +
//     (d ? "a(" : "(") +
//     round((p * int(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 + t) ** 0.5) +
//     "," +
//     round((p * int(b) ** 2 + t) ** 0.5) +
//     "," +
//     round((p * int(c) ** 2 + t) ** 0.5) +
//     (d ? "," + d : ")")
//   );
// };

// /**
//  * pick a contrasting color e.g. for text on a variable color background
//  * using the hsp (perceived brightness) constants from http://alienryderflex.com/hsp.html
//  * @param {number} r - red (0-255)
//  * @param {number} g - green (0-255)
//  * @param {number} b - blue (0-255)
//  * @returns {string} the contrasting rgb color, white or black
//  */
// export const rgbContrast = (r, g, b) => {
//   return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) > 165.75
//     ? "rgb(0,0,0)"
//     : "rgb(255,255,255)";
// };

// /**
//  * parse the current location search params into a usable form
//  * @returns {Map<string, string>} a map of the url search params
//  */
// export const queryParams = () => new URLSearchParams(window.location.search);

// /**
//  * replace special html characters with escaped versions
//  * @param {string} str
//  * @returns {string} escaped string
//  */
// export const escape = (str) =>
//   str
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/'/g, "&#39;")
//     .replace(/"/g, "&quot;")
//     .replace(/\\/g, "&#x5C;");

// /**
//  * copy text to the clipboard
//  * @param {string} str - the string to copy
//  * @returns {Promise<void>}
//  */
// export const copyToClipboard = async (str) => {
//   try {
//     await navigator.clipboard.writeText(str);
//   } catch {
//     const $el = document.createElement("textarea");
//     $el.value = str;
//     $el.setAttribute("readonly", "");
//     $el.style.position = "absolute";
//     $el.style.left = "-9999px";
//     document.body.appendChild($el);
//     $el.select();
//     document.execCommand("copy");
//     document.body.removeChild($el);
//   }
// };

// /**
//  * read text from the clipboard
//  * @returns {Promise<string>}
//  */
// export const readFromClipboard = () => {
//   return navigator.clipboard.readText();
// };

globalThis.__enhancerUtils ??= {};
Object.assign(globalThis.__enhancerUtils, {
  hToString,
  kebabToPascalCase,
  camelToSentenceCase,
});
