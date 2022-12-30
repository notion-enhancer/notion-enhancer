/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// paste this in the devtools console at to generate theme css
// at https://www.notion.so/9390e51f458940a5a339dc4b8fdea2fb

// the variables at the top of the file should be placed in core/variables.css
// as a reference for theme developers, but not loaded into notion.

// the css body below should be passed through https://css-minifier.com/ and
// https://css.github.io/csso/csso.html, then saved to core/theme.css.
// repeat this process for both light and dark modes.

// not yet themed: notion's new svg icons

// future application once cleaned up and improved:
// generate theme at runtime rather than manually building styles

const darkMode = document.body.classList.contains("dark"),
  modeSelector = darkMode ? ".dark" : ":not(.dark)";
let cssRoot = "",
  cssBody = "";

const getComputedPropertyValue = (el, prop) => {
  const styles = window.getComputedStyle(el),
    value = styles.getPropertyValue(prop);
  return value;
};

const generateFontStyles = () => {
  const fontSans = `ui-sans-serif, -apple-system, BlinkMacSystemFont,
      "Segoe UI", Helvetica, "Apple Color Emoji", Arial,
      sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`,
    fontSerif = `Lyon-Text, Georgia, YuMincho, "Yu Mincho",
      "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Songti TC",
      "Songti SC", SimSun, "Nanum Myeongjo", NanumMyeongjo, Batang, serif`,
    fontMono = `iawriter-mono, Nitti, Menlo, Courier, monospace`,
    fontCode = `SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace`;
  cssRoot += `
    --theme--font-sans: ${fontSans};
    --theme--font-serif: ${fontSerif};
    --theme--font-mono: ${fontMono};
    --theme--font-code: ${fontCode};`;
  cssBody += `
    [style*='Segoe UI'] {
      font-family: var(--theme--font-sans, ${
        fontSans.split(",")[0]
      }), ${fontSans} !important;
    }
    [style*='Georgia'] {
      font-family: var(--theme--font-serif, ${
        fontSerif.split(",")[0]
      }), ${fontSerif} !important;
    }
    [style*='iawriter-mono'] {
      font-family: var(--theme--font-mono, ${
        fontMono.split(",")[0]
      }), ${fontMono} !important;
    }
    [style*='SFMono-Regular'] {
      font-family: var(--theme--font-code, ${
        fontCode.split(",")[0]
      }), ${fontCode} !important;
    }
  `;
};
generateFontStyles();

const generateForegroundStyles = () => {
  const rgbPrimary = darkMode ? "rgb(255, 255, 255)" : "rgb(55, 53, 47)",
    defaultPrimary = darkMode ? "rgba(255, 255, 255, 0.81)" : "rgb(55, 53, 47)",
    defaultSecondary = darkMode
      ? "rgb(155, 155, 155)"
      : "rgba(25, 23, 17, 0.6)",
    fgPrimary = new Set([
      rgbPrimary,
      darkMode ? "rgb(211, 211, 211)" : "rgba(255, 255, 255, 0.9)",
    ]),
    fgSecondary = new Set([
      defaultSecondary,
      darkMode ? "rgb(127, 127, 127)" : "rgba(206, 205, 202, 0.6)",
    ]);
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
      text-decoration-color: currentColor !important;
      fill: var(--theme--fg-primary, ${defaultPrimary}) !important;
    }
    .notion-body${modeSelector} .rdp-nav_icon,
    .notion-body${modeSelector} .rdp-head_cell,
    .notion-body${modeSelector} .rdp-day.rdp-day_outside,
    .notion-body${modeSelector} ::placeholder,
    ${[...fgSecondary].map(mapFgToSelectors).join(", ")} {
      color: var(--theme--fg-secondary, ${defaultSecondary}) !important; 
      caret-color: var(--theme--fg-secondary, ${defaultSecondary}) !important;
      text-decoration-color: currentColor !important;
      fill: var(--theme--fg-secondary, ${defaultSecondary}) !important; 
    }
    ${[...fgPrimary]
      .map(
        (colorVal) =>
          `.notion-body${modeSelector} :is(
          [style*="caret-color:${colorVal}"], [style*="caret-color: ${colorVal}"])`
      )
      .join(", ")} {
      caret-color: var(--theme--fg-primary, ${defaultPrimary}) !important;
    }
    .notion-body${modeSelector} ::placeholder,
    ${[...fgSecondary]
      .map(
        (colorVal) =>
          `.notion-body${modeSelector} :is(
          [style*="caret-color:${colorVal}"], [style*="caret-color: ${colorVal}"])`
      )
      .join(", ")} {
      caret-color: var(--theme--fg-secondary, ${defaultSecondary}) !important;
    }
    .notion-body${modeSelector} [style*="-webkit-text-fill-color:"] {
      -webkit-text-fill-color: var(--theme--fg-secondary, ${defaultSecondary}) !important;
    }
  `;

  // borders
  const defaultBorder = darkMode ? "rgb(47, 47, 47)" : "rgb(233, 233, 231)",
    possibleBorders = darkMode
      ? [defaultBorder.slice(4, -1), "255, 255, 255"]
      : [defaultBorder.slice(4, -1), "55, 53, 47"],
    borderColors = new Set([
      darkMode ? "rgb(37, 37, 37)" : "rgb(238, 238, 237)",
    ]),
    boxShadows = new Set(
      darkMode
        ? [
            "; box-shadow: rgba(255, 255, 255, 0.094) 0px -1px 0px;",
            "; box-shadow: rgba(15, 15, 15, 0.2) 0px 0px 0px 1px inset;",
            "; box-shadow: rgb(25, 25, 25) -3px 0px 0px, rgb(47, 47, 47) 0px 1px 0px;",
          ]
        : [
            "; box-shadow: rgba(55, 53, 47, 0.09) 0px -1px 0px;",
            "; box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset;",
            "; box-shadow: white -3px 0px 0px, rgb(233, 233, 231) 0px 1px 0px;",
          ]
    );
  for (const el of document.querySelectorAll(
    `[style*="border:"], [style*="border-right:"], [style*="border-left:"],
    [style*="border-top:"], [style*="border-bottom:"], [style*="box-shadow:"]`
  )) {
    const borderColor = el
      .getAttribute("style")
      .match(/(?:^|(?:;\s*))border(?:-\w+)?:\s*([^;]+);?/)?.[1];
    if (
      borderColor &&
      possibleBorders.some((border) => borderColor.includes(border))
    ) {
      borderColors.add(borderColor);
    }
    const boxShadowStyle = el
      .getAttribute("style")
      .match(/(?:^|(?:;\s*))box-shadow:\s*([^;]+);?/)?.[0];
    if (
      boxShadowStyle &&
      possibleBorders.some((border) => boxShadowStyle.includes(border))
    ) {
      boxShadows.add(boxShadowStyle);
    }
  }
  cssRoot += `--theme--fg-border: ${defaultBorder};`;
  cssBody += `
    .notion-body${modeSelector} ${[...borderColors]
    .map(
      (border) =>
        `[style*="${border}"]:is([style*="border:"],
        [style*="border-top:"], [style*="border-left:"],
        [style*="border-bottom:"], [style*="border-right:"])`
    )
    .join(", ")} {
      border-color: var(--theme--fg-border, ${defaultBorder}) !important;
    }
    ${[...boxShadows]
      .map(
        (shadow, i) =>
          `.notion-body${modeSelector} [style*="${shadow}"] {
            ${shadow
              .replace(
                /rgba?\([^\)]+\)/g,
                i === 2
                  ? "transparent"
                  : `var(--theme--fg-border, ${defaultBorder})`
              )
              .slice(0, -1)} !important;
      }`
      )
      .join("")}
    .notion-body${modeSelector} [style*="height: 1px;"][style*="background"] {
      background: var(--theme--fg-border, ${defaultBorder}) !important;
    }
  `;

  const refs = {};
  // inline text color
  for (const el of document.querySelectorAll(
    '.notion-selectable .notion-enable-hover[style*="color:"][style*="fill:"]'
  )) {
    if (!el.innerText || el.innerText.includes(" ")) continue;
    if (el.getAttribute("style").includes("mono")) continue;
    const cssVar = `--theme--fg-${el.innerText}`,
      colorVal = getComputedPropertyValue(el, "color"),
      styleAttr = el
        .getAttribute("style")
        .match(/(?:^|(?:;\s*))color:\s*([^;]+);?/)[1];
    cssRoot += `${cssVar}: ${colorVal};`;
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} .notion-enable-hover[style*="${styleAttr}"],
      .notion-body${modeSelector} .notion-code-block span.token[style*="${styleAttr}"]`
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
  for (const group of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    // get color name from card
    const card = group.querySelector('a[style*="background"]'),
      innerText = card.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || innerText.includes(" ")) continue;
    const el = group.querySelector('[style*="height: 32px"]'),
      colorVal = getComputedPropertyValue(el, "color"),
      cssVar = `--theme--fg-${
        // --fg-light_gray doesn't exist
        innerText === "light_gray" ? "secondary" : innerText
      }`,
      styleAttr = group
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
  const defaultPrimary = darkMode ? "rgb(25, 25, 25)" : "rgb(255, 255, 255)",
    defaultSecondary = darkMode ? "rgb(32, 32, 32)" : "rgb(251, 251, 250)",
    bgPrimary = new Set([
      defaultPrimary,
      ...(darkMode
        ? ["rgb(37, 37, 37)", "rgba(255, 255, 255, 0.13)"]
        : ["white", "rgb(247, 247, 247)"]),
    ]),
    bgSecondary = new Set([
      defaultSecondary,
      ...(darkMode
        ? ["rgba(255, 255, 255, 0.0", "rgb(47, 47, 47)"]
        : ["rgb(253, 253, 253)", "rgb(15, 15, 15)"]),
    ]),
    bgOverlay = darkMode ? "rgba(15, 15, 15, 0.8)" : "rgba(15, 15, 15, 0.6)";
  for (const el of document.querySelectorAll(
    '[style*="background:"], [style*="background-color:"]'
  )) {
    const colorVal = el
      .getAttribute("style")
      .match(/background(?:-color)?:\s*([^;]+);?/)?.[1];
    if (colorVal.startsWith(`rgba(${defaultPrimary.slice(4, -1)}`)) {
      const alpha = +colorVal.slice(5, -1).split(", ")[3];
      if (alpha > 0.8) {
        bgPrimary.add(colorVal);
      } else bgSecondary.add(colorVal);
    }
  }
  cssRoot += `
    --theme--bg-primary: ${defaultPrimary};
    --theme--bg-secondary: ${defaultSecondary};
    --theme--overlay-shadow: ${bgOverlay};
  `;
  const mapBgToSelectors = (colorVal) =>
    `.notion-body${modeSelector} [style*="background:${colorVal}"],
    .notion-body${modeSelector} [style*="background: ${colorVal}"],
    .notion-body${modeSelector} [style*="background-color:${colorVal}"],
    .notion-body${modeSelector} [style*="background-color: ${colorVal}"]`;
  cssBody += `
    ${[...bgPrimary].map(mapBgToSelectors).join(", ")} {
      background: var(--theme--bg-primary, ${defaultPrimary}) !important;
    }
     .notion-body${modeSelector} .notion-focusable-within
     [style*="background"]:not([style*="background: none"]),
    ${[...bgSecondary].map(mapBgToSelectors).join(", ")} {
      background: var(--theme--bg-secondary, ${defaultSecondary}) !important;
    }
    [style*="linear-gradient(to left, ${
      defaultPrimary === "rgb(255, 255, 255)" ? "white" : defaultPrimary
    } 20%, rgba(${defaultPrimary.slice(4, -1)}, 0) 100%)"] {
      background-image: linear-gradient(to left,
        var(--theme--bg-primary, ${defaultPrimary}) 20%, transparent 100%) !important;
    }
    [style*="linear-gradient(to right, ${
      defaultPrimary === "rgb(255, 255, 255)" ? "white" : defaultPrimary
    } 20%, rgba(${defaultPrimary.slice(4, -1)}, 0) 100%)"] {
      background-image: linear-gradient(to right,
        var(--theme--bg-primary, ${defaultPrimary}) 20%, transparent 100%) !important;
    }
    .notion-body${modeSelector} .notion-overlay-container
    [data-overlay] > div > [style*="position: absolute"]:first-child {
      background: var(--theme--overlay-shadow, ${bgOverlay}) !important;
    }
  `;

  // hovered elements, inputs and unchecked toggle backgrounds
  const bgHover = darkMode
    ? ["rgba(255, 255, 255, 0.055)", "rgb(47, 47, 47)"]
    : [
        "rgba(55, 53, 47, 0.08)",
        "rgba(242, 241, 238, 0.6)",
        "rgb(225, 225, 225)",
        "rgb(239, 239, 238)",
      ];
  cssRoot += `--theme--bg-hover: ${bgHover[0]};`;
  cssBody += `${bgHover
    .map(
      (hover) => `.notion-body${modeSelector} :is(
        [style*="background: ${hover}"], [style*="background-color: ${hover}"]
      )${
        hover === "rgb(47, 47, 47)"
          ? '[style*="transition: background"]:hover'
          : ""
      }`
    )
    .join(", ")},
    .notion-body${modeSelector} [style*="height: 14px; width: 26px; border-radius: 44px;"][style*="rgba"] {
    background: var(--theme--bg-hover, ${bgHover[0]}) !important;
  }`;

  // get bg variable values from tags
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
    '.notion-selectable .notion-enable-hover[style*="background:"]',
    // block highlight
    '.notion-text-block > [style*="background:"]',
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
  // board cards
  for (const group of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    const page = group.querySelector('a[style*="background"]'),
      innerText = page.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || innerText.includes(" ")) continue;
    const pageVar = `--theme--bg-${innerText}`,
      pageColor = getComputedPropertyValue(page, "background-color"),
      groupVar = `--theme--dim-${innerText}`,
      groupColor = group
        .getAttribute("style")
        .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    // get dim variable values
    cssRoot += `${groupVar}: ${groupColor};`;
    // in light mode pages in board views all have bg "white"
    // by default, must be styled based on parent
    refs[`${pageVar}, ${pageColor}`] ??= [];
    refs[`${pageVar}, ${pageColor}`].push(
      `.notion-body${modeSelector} .notion-board-view
      .notion-board-group[style*="${groupColor}"] a[style*="background"]`
    );
    refs[`${groupVar}, ${groupColor}`] ??= [];
    refs[`${groupVar}, ${groupColor}`].push(
      `.notion-body${modeSelector} .notion-board-view
      [style*="${groupColor}"]:is(.notion-board-group, [style*="border-top-left-radius: 5px;"])`
    );
  }
  // use bg-yellow for notification highlights
  refs[`--theme--bg-yellow, rgba(255, 212, 0, 0.14)`] ??= [];
  refs[`--theme--bg-yellow, rgba(255, 212, 0, 0.14)`].push(
    `.notion-body${modeSelector} [style*="background: rgba(255, 212, 0, 0.14)"]`
  );
  // use dim for callout blocks
  for (const el of document.querySelectorAll(
    '.notion-callout-block > div > [style*="background:"]'
  )) {
    if (!el.innerText || el.innerText.includes(" ")) continue;
    const cssVar = `--theme--dim-${el.innerText}`,
      colorVal = getComputedPropertyValue(el, "background-color"),
      styleAttr = el
        .getAttribute("style")
        .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    refs[`${cssVar}, ${colorVal}`] ??= [];
    refs[`${cssVar}, ${colorVal}`].push(
      `.notion-body${modeSelector} .notion-callout-block > div
        > [style*="background:"][style*="${styleAttr}"]`
    );
  }
  // use light_gray for taglike elements e.g. file property values
  const taglikeEl = document.querySelector(
      '[style*="height: 18px; border-radius: 3px; background"]'
    ),
    taglikeBg = taglikeEl
      .getAttribute("style")
      .match(/background(?:-color)?:\s*([^;]+);?/)[1];
  refs[`--theme--bg-light_gray, ${taglikeBg}`] ??= [];
  refs[`--theme--bg-light_gray, ${taglikeBg}`].push(
    `[style*="height: 18px; border-radius: 3px; background"][style*="${taglikeBg}"]`
  );
  // group selectors with same bg together
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
    accentPrimaryTransparent = [
      "rgba(35, 131, 226, 0.14)",
      "rgba(35, 131, 226, 0.",
    ],
    accentPrimaryBoxShadows = [
      "box-shadow: rgb(35, 131, 226) 0px 0px 0px 2px inset",
    ],
    accentSecondary = [
      "rgb(235, 87, 87)",
      "rgb(180, 65, 60)",
      "rgb(211, 79, 67)",
      "rgb(205, 73, 69)",
    ],
    accentSecondaryContrast = "rgb(255, 255, 255)",
    accentSecondaryTransparent = "rgba(235, 87, 87, 0.1)",
    accentSecondaryBorder = [
      "border: 1px solid rgb(110, 54, 48)",
      "border: 1px solid rgba(235, 87, 87, 0.5)",
      "border: 2px solid rgb(110, 54, 48)",
      "border: 2px solid rgb(227, 134, 118)",
      "border-right: 1px solid rgb(180, 65, 60)",
      "border-right: 1px solid rgb(211, 79, 67)",
    ];
  cssRoot += `--theme--accent-primary: ${accentPrimary};
    --theme--accent-primary_hover: ${accentPrimaryHover};
    --theme--accent-primary_contrast: ${accentPrimaryContrast};
    --theme--accent-primary_transparent: ${accentPrimaryTransparent[0]};
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
    .notion-focusable-within:focus-within {
      box-shadow: var(--theme--accent-primary, ${accentPrimary}) 0px 0px 0px 1px inset,
        var(--theme--accent-primary, ${accentPrimary}) 0px 0px 0px 2px !important;
    }
    .notion-focusable:focus-visible {
      box-shadow: var(--theme--accent-primary, ${accentPrimary}) 0px 0px 0px 1px inset,
        var(--theme--accent-primary, ${accentPrimary}) 0px 0px 0px 2px !important;
    }
    ${[...accentPrimaryBoxShadows]
      .map(
        (shadow) =>
          `[style*="${shadow}"] {
            ${shadow.replace(
              /rgba?\([^\)]+\)/g,
              `var(--theme--accent-primary, ${accentPrimary})`
            )} !important;
      }`
      )
      .join("")}
    *::selection,
    .notion-selectable-halo,
    #notion-app .rdp-day:not(.rdp-day_disabled):not(.rdp-day_selected):not(.rdp-day_value):not(.rdp-day_start):not(.rdp-day_end):hover,
    [style*="background: ${accentPrimaryTransparent[1]}"],
    [style*="background-color: ${accentPrimaryTransparent[1]}"] {
      background: var(--theme--accent-primary_transparent, ${
        accentPrimaryTransparent[0]
      }) !important;
    }
    ${accentSecondary
      .map(
        (accent) =>
          `[style*="color: ${accent}"],
          [style*="fill: ${accent}"]`
      )
      .join(", ")} {
      color: var(--theme--accent-secondary, ${accentSecondary[0]}) !important;
      fill: var(--theme--accent-secondary, ${accentSecondary[0]}) !important;
    }
    #notion-app .rdp-day_today:not(.rdp-day_selected):not(.rdp-day_value):not(.rdp-day_start):not(.rdp-day_end)::after,
    ${accentSecondary
      .map(
        (accent) =>
          `[style*="background: ${accent}"],
          [style*="background-color: ${accent}"]`
      )
      .join(", ")} {
      background: var(--theme--accent-secondary, ${
        accentSecondary[0]
      }) !important;
      color: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
      fill: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
    }
    #notion-app .rdp-day_today:not(.rdp-day_selected):not(.rdp-day_value):not(.rdp-day_start):not(.rdp-day_end),
    :is(${accentSecondary
      .map(
        (accent) =>
          `[style*="background: ${accent}"],
          [style*="background-color: ${accent}"]`
      )
      .join(", ")})
    + :is([style*="fill: white;"], [style*="color: white;"]),
    :is(${accentSecondary
      .map(
        (accent) =>
          `[style*="background: ${accent}"],
          [style*="background-color: ${accent}"]`
      )
      .join(", ")})
    :is([style*="fill: white;"], [style*="color: white;"]) {
      color: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
      fill: var(--theme--accent-secondary_contrast, ${accentSecondaryContrast}) !important;
    }
    [style*="background: ${accentSecondaryTransparent}"],
    [style*="background-color: ${accentSecondaryTransparent}"] {
      background: var(--theme--accent-secondary_transparent, ${accentSecondaryTransparent}) !important;
    }
    ${accentSecondaryBorder
      .map((border) => `[style*="${border}"]`)
      .join(", ")} {
      border-color: var(--theme--accent-secondary, ${
        accentSecondary[0]
      }) !important;
    }`;
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
    .notion-body${modeSelector} ::-webkit-scrollbar-track,
    .notion-body${modeSelector} ::-webkit-scrollbar-corner {
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
    // patch: remove backgrounds from prism tokens
    if (!darkMode) {
      cssBody += `
        .notion-body${modeSelector} .token.operator,
        .notion-body${modeSelector} .token.entity,
        .notion-body${modeSelector} .token.url,
        .notion-body${modeSelector} .language-css .token.string,
        .notion-body${modeSelector} .style .token.string {
          background: transparent !important;
        }
      `;
    }
  };
generateCodeStyles();

const cssDoc = `body${modeSelector} { ${cssRoot} } ${cssBody}`;
console.log(cssDoc);
