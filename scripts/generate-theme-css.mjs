/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// paste this in the devtools console at to generate theme css
// at https://www.notion.so/9390e51f458940a5a339dc4b8fdea2fb

// the variables at the top of the file should be placed in core/variables.css
// as a reference for theme developers, but not loaded into notion.

// the css body below should be passed through https://css.github.io/csso/csso.html
// and then saved to core/theme.css. repeat this process for both light and dark modes

const darkMode = document.body.classList.contains("dark"),
  modeSelector = darkMode ? ".dark" : ":not(.dark)";
let cssRoot = "",
  cssBody = "";

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

const generateForegroundStyles = () => {
  const rgbPrimary = darkMode ? "rgb(255, 255, 255)" : "rgb(55, 53, 47)",
    defaultPrimary = darkMode ? "rgba(255, 255, 255, 0.81)" : "rgb(55, 53, 47)",
    defaultSecondary = darkMode
      ? "rgb(155, 155, 155)"
      : "rgba(25, 23, 17, 0.6)",
    fgPrimary = new Set([rgbPrimary]),
    fgSecondary = new Set([defaultSecondary]);
  for (const el of document.querySelectorAll(
    '[style^="color"], [style*=" color"], [style*=";color"], [style*="fill"]'
  )) {
    const colorVal =
        el
          .getAttribute("style")
          .match(/(?:^|(?:;\s*))color:\s*([^;]+);?/)?.[1] ??
        getComputedPropertyValue(el, "color"),
      fillVal =
        el
          .getAttribute("style")
          .match(/(?:^|(?:;\s*))fill:\s*([^;]+);?/)?.[1] ??
        getComputedPropertyValue(el, "fill");
    if (colorVal.startsWith(`rgba(${rgbPrimary.slice(4, -1)}`)) {
      const alpha = +colorVal.slice(5, -1).split(", ")[3];
      if (alpha > 0.8) {
        fgPrimary.add(colorVal);
      } else fgSecondary.add(colorVal);
    }
    if (fillVal.startsWith(`rgba(${rgbPrimary.slice(4, -1)}`)) {
      const alpha = +fillVal.slice(5, -1).split(", ")[3];
      if (alpha > 0.8) {
        fgPrimary.add(fillVal);
      } else fgSecondary.add(fillVal);
    }
    if (
      // light mode tags have coloured text,
      // replace with primary text for consistency
      !darkMode &&
      el.matches(
        `[style*="height: 20px; border-radius: 3px; padding-left: 6px;"][style*="background:"],
        .notion-collection_view-block [style*="height: 14px; border-radius: 3px; padding-left: 6px;"],
        .notion-timeline-item-properties [style*="height: 18px; border-radius: 3px; padding-left: 8px;"]`
      )
    ) {
      fgPrimary.add(colorVal);
    }
  }
  cssRoot += `
    --theme--fg-primary: ${defaultPrimary};
    --theme--fg-secondary: ${defaultSecondary};
  `;
  const mapFgToSelectors = (colorVal) =>
    `.notion-body${modeSelector} [style^="color:${colorVal}"],
    .notion-body${modeSelector} [style^="color: ${colorVal}"],
    .notion-body${modeSelector} [style*=" color:${colorVal}"],
    .notion-body${modeSelector} [style*=" color: ${colorVal}"],
    .notion-body${modeSelector} [style*=";color:${colorVal}"],
    .notion-body${modeSelector} [style*=";color: ${colorVal}"],
    .notion-body${modeSelector} [style*="fill:${colorVal}"],
    .notion-body${modeSelector} [style*="fill: ${colorVal}"]`;
  cssBody += `
  ${[...fgPrimary].map(mapFgToSelectors).join(", ")} {
      color: var(--theme--fg-primary, ${defaultPrimary}) !important;
      caret-color: var(--theme--fg-primary, ${defaultPrimary}) !important;
      -webkit-text-fill-color: currentColor !important;
      fill: var(--theme--fg-primary, ${defaultPrimary}) !important;
    }
    ${[...fgSecondary].map(mapFgToSelectors).join(", ")} {
      color: var(--theme--fg-secondary, ${defaultSecondary}) !important; 
      caret-color: var(--theme--fg-secondary, ${defaultSecondary}) !important;
      -webkit-text-fill-color: currentColor !important;
      fill: var(--theme--fg-secondary, ${defaultSecondary}) !important; 
    }
  `;

  const refs = {};
  // inline text color
  for (const el of document.querySelectorAll(
    '.notion-selectable .notion-enable-hover[style*="color:"][style*="fill:"]'
  )) {
    if (!el.innerText || el.innerText.includes(" ")) continue;
    const cssVar = `--theme--fg-${el.innerText}`,
      colorVal = getComputedPropertyValue(el, "color"),
      styleAttr = el.getAttribute("style");
    cssRoot += `${cssVar}: ${colorVal};`;
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} .notion-enable-hover[style*="${styleAttr}"]`
    );
  }
  // block text color
  const targetSelector =
    '.notion-text-block > [style*="color:"][style*="fill:"]';
  for (const el of document.querySelectorAll(targetSelector)) {
    if (!el.innerText || el.innerText.includes(" ")) continue;
    const cssVar = `--theme--fg-${el.innerText}`,
      colorVal = getComputedPropertyValue(el, "color"),
      styleAttr = el
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))color:\s*([^;]+);?/)[1];
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} ${targetSelector}[style*="${styleAttr}"]`
    );
  }
  // board text
  for (const parent of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    // get color name from card
    const card = parent.querySelector('a[style*="background"]'),
      innerText = card.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || innerText.includes(" ")) continue;
    const el = parent.querySelector('[style*="height: 32px"]'),
      colorVal = getComputedPropertyValue(el, "color"),
      cssVar = `--theme--fg-${
        // --fg-light_gray doesn't exist
        innerText === "light_gray" ? "secondary" : innerText
      }`,
      styleAttr = parent
        .getAttribute("style")
        .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} .notion-board-view :is(
          .notion-board-group[style*="${styleAttr}"] [style*="height: 32px"],
          [style*="${styleAttr}"] > [style*="color"]:nth-child(2),
          [style*="${styleAttr}"] > div > svg
        )`
    );
  }
  for (const varRef in refs) {
    cssBody += `${refs[varRef].join(",")} {
        color: var(${varRef}) !important;
        fill: var(${varRef}) !important;
      }`;
  }
};
generateForegroundStyles();

const generateBackgroundStyles = () => {
  for (const el of document.querySelectorAll(
    '.notion-collection_view-block [style*="height: 20px; border-radius: 3px; padding-left: 6px;"]'
  )) {
    if (!el.innerText || el.innerText.includes(" ")) continue;
    const cssVar = `--theme--bg-${el.innerText}`,
      colorVal = getComputedPropertyValue(el, "background-color");
    cssRoot += `${cssVar}: ${colorVal};`;
  }
  const refs = {};
  for (const targetSelector of [
    // inline highlight
    '.notion-selectable .notion-enable-hover[style^="background:"]',
    // block highlight
    '.notion-text-block > [style*="background:"]',
    // callout block
    '.notion-callout-block > div > [style*="background:"]',
    // database tag
    '[style*="height: 20px; border-radius: 3px; padding-left: 6px;"][style*="background:"]',
    '.notion-collection_view-block [style*="height: 14px; border-radius: 3px; padding-left: 6px;"]',
    '.notion-timeline-item-properties [style*="height: 18px; border-radius: 3px; padding-left: 8px;"]',
  ]) {
    for (const el of document.querySelectorAll(targetSelector)) {
      if (!el.innerText || el.innerText.includes(" ")) continue;
      const cssVar = `--theme--bg-${el.innerText}`,
        colorVal = getComputedPropertyValue(el, "background-color"),
        styleAttr = el
          .getAttribute("style")
          .match(/background(?:-color)?:\s*([^;]+);?/)[1];
      refs[`${cssVar}, ${colorVal}`] ??= [];
      refs[`${cssVar}, ${colorVal}`].push(
        `.notion-body${modeSelector} ${targetSelector}[style*="${styleAttr}"]`
      );
    }
  }
  // board card: in light mode all have bg "white" by default,
  // must be styled based on parent
  for (const parent of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    const el = parent.querySelector('a[style*="background"]'),
      innerText = el.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || innerText.includes(" ")) continue;
    const cssVar = `--theme--bg-${innerText}`,
      colorVal = getComputedPropertyValue(el, "background-color"),
      styleAttr = parent
        .getAttribute("style")
        .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} .notion-board-view
       .notion-board-group[style*="${styleAttr}"] a[style*="background"]`
    );
  }
  for (const varRef in refs) {
    cssBody += `${refs[varRef].join(",")} {
      background: var(${varRef}) !important;
    }`;
  }
};
generateBackgroundStyles();

const generateAccentStyles = () => {
  // accents are the same in both light and dark modes
  // duplicate styles should be removed by csso
  const accentPrimary = "rgb(35, 131, 226)",
    accentPrimaryHover = "rgb(0, 117, 211)",
    accentPrimaryContrast = "rgb(255, 255, 255)",
    accentPrimaryTransparent = "rgba(35, 131, 226, 0.14)",
    accentSecondary = [
      "rgb(235, 87, 87)",
      "rgb(180, 65, 60)",
      "rgb(205, 73, 69)",
    ],
    accentSecondaryContrast = "rgb(255, 255, 255)",
    accentSecondaryTransparent = "rgba(235, 87, 87, 0.1)",
    accentSecondaryBorder = "1px solid rgb(110, 54, 48)";
  cssRoot += `--theme--accent-primary: ${accentPrimary};
    --theme--accent-primary_hover: ${accentPrimaryHover};
    --theme--accent-primary_contrast: ${accentPrimaryContrast};
    --theme--accent-primary_transparent: ${accentPrimaryTransparent};
    --theme--accent-secondary: ${accentSecondary[0]};
    --theme--accent-secondary_contrast: ${accentSecondaryContrast};
    --theme--accent-secondary_transparent: ${accentSecondaryTransparent};`;
  cssBody += `
    [style*="color: ${accentPrimary}"],
    [style*="fill: ${accentPrimary}"] {
      color: var(--theme--accent-primary, ${accentPrimary}) !important;
    }
    [style*="background: ${accentPrimary}"],
    [style*="background-color: ${accentPrimary}"] {
      background: var(--theme--accent-primary, ${accentPrimary}) !important;
      color: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
      fill: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
    }
    [style*="background: ${accentPrimary}"] svg[style*="fill"],
    [style*="background-color: ${accentPrimary}"]  svg[style*="fill"] {
      fill: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
    }
    [style*="border-radius: 44px;"] > [style*="border-radius: 44px; background: white;"] {
      background: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
    }
    [style*="background: ${accentPrimaryHover}"],
    [style*="background-color: ${accentPrimaryHover}"] {
      background: var(--theme--accent-primary_hover, ${accentPrimaryHover}) !important;
      color: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
      fill: var(--theme--accent-primary_contrast, ${accentPrimaryContrast}) !important;
    }
    .notion-table-selection-overlay [style*='border: 2px solid'] {
      border-color: var(--theme--accent-primary, ${accentPrimary}) !important;
    }
    *::selection,
    .notion-selectable-halo,
    [style*="background: ${accentPrimaryTransparent}"],
    [style*="background-color: ${accentPrimaryTransparent}"] {
      background: var(--theme--accent-primary_transparent, ${accentPrimaryTransparent}) !important;
    }
    [style*="color: ${accentSecondary[0]}"],
    [style*="color: ${accentSecondary[1]}"],
    [style*="fill: ${accentSecondary[0]}"],
    [style*="fill: ${accentSecondary[1]}"] {
      color: var(--theme--accent-secondary, ${accentSecondary}) !important;
    }
    [style*="background: ${accentSecondary[0]}"],
    [style*="background: ${accentSecondary[1]}"],
    [style*="background: ${accentSecondary[2]}"],
    [style*="background-color: ${accentSecondary[0]}"],
    [style*="background-color: ${accentSecondary[1]}"],
    [style*="background-color: ${accentSecondary[2]}"] {
      background: var(--theme--accent-secondary, ${accentSecondary[0]}) !important;
      color: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
      fill: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
    }
    [style*="background: ${accentSecondary[1]}"] + [style*="color: white;"] {
      color: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
      fill: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
    }
    [style*="background: ${accentSecondaryTransparent}"],
    [style*="background-color: ${accentSecondaryTransparent}"] {
      background: var(--theme--accent-secondary_transparent, ${accentSecondaryTransparent}) !important;
    }
    [style*="border: ${accentSecondaryBorder}"] {
      border-color: var(--theme--accent-secondary, ${accentSecondary[0]}) !important;
    }
    `;
};
generateAccentStyles();

const generateScrollbarStyles = () => {
  const scrollbarTrack = darkMode ? "rgba(202, 204, 206, 0.04)" : "#EDECE9",
    scrollbarThumb = darkMode ? "#474c50" : "#D3D1CB",
    scrollbarThumbHover = darkMode ? "rgba(202, 204, 206, 0.3)" : "#AEACA6";
  cssRoot += `--theme--scrollbar-track: ${scrollbarTrack};
    --theme--scrollbar-thumb: ${scrollbarThumb};
    --theme--scrollbar-thumb_hover: ${scrollbarThumbHover};`;
  cssBody += `
    .notion-body${modeSelector} ::-webkit-scrollbar-track {
      background: var(--theme--scrollbar-track, ${scrollbarTrack}) !important;
    }
    .notion-body${modeSelector} ::-webkit-scrollbar-thumb {
      background: var(--theme--scrollbar-thumb, ${scrollbarThumb}) !important;
    }
    .notion-body${modeSelector} ::-webkit-scrollbar-thumb:hover {
      background: var(--theme--scrollbar-thumb_hover, ${scrollbarThumbHover}) !important;
    }
  `;
};
generateScrollbarStyles();

const prismTokens = [
    // all standard tokens from https://prismjs.com/tokens.html
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
  ],
  generateCodeStyles = () => {
    const inlineCode = document.querySelector(
        '.notion-text-block .notion-enable-hover[style*="mono"]'
      ),
      inlineFg = inlineCode
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))color:\s*([^;]+);?/)?.[1],
      inlineBg = inlineCode
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))background:\s*([^;]+);?/)?.[1];
    cssRoot += `
      --theme--code-inline_fg: ${inlineFg};
      --theme--code-inline_bg: ${inlineBg};`;
    cssBody += `
      .notion-body${modeSelector} .notion-text-block
      .notion-enable-hover[style*="mono"][style*="color:${inlineFg}"] {
        color: var(--theme--code-inline_fg, ${inlineFg}) !important;
      }
      .notion-body${modeSelector} .notion-text-block
      .notion-enable-hover[style*="mono"][style*="background:${inlineBg}"] {
        background: var(--theme--code-inline_bg, ${inlineBg}) !important;
      }
    `;
    const blockFg = document
        .querySelector('.notion-code-block > [style*="mono"]')
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))color:\s*([^;]+);?/)?.[1],
      blockBg = document
        .querySelector('.notion-code-block > div > [style*="background"]')
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))background:\s*([^;]+);?/)?.[1];
    cssRoot += `--theme--code-block_fg: ${blockFg};
      --theme--code-block_bg: ${blockBg};`;
    cssBody += `
      .notion-body${modeSelector} .notion-code-block > [style*="mono"] {
        color: var(--theme--code-block_fg, ${blockFg}) !important;
      }
      .notion-body${modeSelector} .notion-code-block > div > [style*="background"] {
        background: var(--theme--code-block_bg, ${blockBg}) !important;
      }
    `;
    const refs = {},
      el = document.querySelector(".notion-code-block .token");
    for (const token of prismTokens) {
      el.className = `token ${token}`;
      const cssVar = `--theme--code-${token.replace(/-/g, "_")}`,
        colorVal = getComputedPropertyValue(el, "color");
      refs[colorVal] ??= cssVar;
      cssRoot += `${cssVar}: ${
        refs[colorVal] === cssVar ? colorVal : `var(${refs[colorVal]})`
      };`;
      cssBody += `.notion-body${modeSelector} .notion-code-block .token.${token} {
        color: var(${cssVar}, ${colorVal}) !important;
      }`;
    }
  };
generateCodeStyles();

const cssDoc = `body${modeSelector} { ${cssRoot} } ${cssBody}`;
console.log(cssDoc);
