/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// these utils are for manual use (e.g. in the devtools console)
// to assist in the generation of the theme.css and variables.css files

const cssProperties = [
    "background-color",
    "border-color",
    "box-shadow",
    "caret-color",
    "color",
    "fill",
    "outline-color",
    "text-decoration-color",
  ],
  prismTokens = [
    "keyword",
    "builtin",
    "class-name",
    "function",
    "boolean",
    "number",
    "string",
    "char",
    "symbol",
    "regex",
    "url",
    "operator",
    "variable",
    "constant",
    "property",
    "punctuation",
    "important",
    "comment",
    "tag",
    "attr-name",
    "attr-value",
    "namespace",
    "prolog",
    "doctype",
    "cdata",
    "entity",
    "atrule",
    "selector",
    "inserted",
    "deleted",
  ];

const generateQuerySelector = (el) => {
    if (el.tagName === "HTML") return "html";
    const parentSelector = generateQuerySelector(el.parentElement);
    if (el.id) return `${parentSelector} > #${el.id}`;
    const classes = [...el.classList].map((cls) => `.${cls}`).join(""),
      style = el.getAttribute("style")
        ? `[style="${el.getAttribute("style").replace(/"/g, "'")}"]`
        : "",
      index = `:nth-child(${[...el.parentElement.children].indexOf(el) + 1})`;
    return `${parentSelector} > ${classes || style || index}`;
  },
  getComputedPropertyValue = (el, prop) => {
    const styles = window.getComputedStyle(el),
      value = styles.getPropertyValue(prop);
    return value;
  };

const generatePrismVariables = () => {
  let cssVariables = "",
    colourRefs = {};
  const el = document.querySelector(".notion-code-block .token");
  for (const token of prismTokens) {
    el.className = `token ${token}`;
    const varName = token.replace(/-/g, "_"),
      colourValue = getComputedPropertyValue(el, "color");
    colourRefs[colourValue] ??= varName;
    cssVariables += `--theme--code-${varName}: ${
      colourRefs[colourValue] === varName
        ? colourValue
        : `var(--theme--code-${colourRefs[colourValue]})`
    };`;
  }
  return cssVariables;
};

console.log(generatePrismVariables());

//   getComputedPropertyValues = (el) => {
//     const styles = window.getComputedStyle(el),
//       values = cssProperties.map((prop) => [
//         prop,
//         styles.getPropertyValue(prop),
//       ]);
//     return Object.fromEntries(values);
//   },
//   indexCssValues = () => {
//     // Map<value, { [k: property]: selector[] }
//     const cssValues = new Map();
//     for (const el of document.querySelectorAll("*")) {
//       const styles = getComputedPropertyValues(el),
//         selector = generateQuerySelector(el);
//       for (const prop in styles) {
//         const value = styles[prop];
//         if (value.includes("svg") || value.includes("url")) continue;
//         if (!(value.includes("rgb") || value.includes("#"))) continue;
//         if (!cssValues.has(value)) cssValues.set(value, {});
//         cssValues.get(value)[prop] ??= [];
//         cssValues.get(value)[prop].push(selector);
//       }
//     }
//     return cssValues;
//   },
//   mapCssValuesToVariables = (cssValues) => {
//     let i = 0,
//       cssRoot = "",
//       cssBody = "";
//     for (const [value, props] of cssValues) {
//       cssRoot += `--${++i}: ${value};`;
//       for (const prop in props) {
//         cssBody += `${props[prop].join(", ")} { ${prop}: var(--${i}); }`;
//       }
//     }
//     return `:root { ${cssRoot} } ${cssBody}`;
//   };
