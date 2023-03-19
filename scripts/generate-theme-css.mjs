/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// paste this in the devtools console at to generate theme css
// at https://www.notion.so/9390e51f458940a5a339dc4b8fdea2fb.
// to detect fonts, open the ... menu before running.

// repeat for both light and dark modes, pass the css through
// https://css-minifier.com/ and https://css.github.io/csso/csso.html
// and then save it to core/variables.css and core/theme.css

// todo: svg page & property icons

const darkMode = document.body.classList.contains("dark"),
  modeSelector = darkMode ? ".dark" : ":not(.dark)",
  bodySelector = `.notion-body${modeSelector}`;
let cssRoot = "",
  cssBody = "",
  cssRefs = {};

const getComputedPropertyValue = (el, prop) => {
    const styles = window.getComputedStyle(el),
      value = styles.getPropertyValue(prop);
    return value;
  },
  cssVariable = ({ name, value, alias, splitValues = false }) => {
    const values = splitValues ? value.split(", ") : [value],
      rgbPattern = /^rgba?\(\d{1,3},\d{1,3},\d{1,3}(?:,\d{1,3})?\)$/,
      isColor = rgbPattern.test(value.replace(/\s/g, ""));
    if (isColor) {
      values[0] = values[0].replace(/\s/g, "");
      const hasOpaqueAlpha =
        values[0].trim().startsWith("rgba(") &&
        values[0].trim().endsWith(",1)");
      if (hasOpaqueAlpha) values[0] = `rgb(${values[0].slice(5, -3)})`;
    }
    if (!cssRoot.includes(`--theme--${name}:`)) {
      cssRoot += `--theme--${name}:${
        alias ? `var(--theme--${alias})` : value
      };`;
    }
    return {
      name,
      value,
      ref: `var(--theme--${name},${values[0]})${
        values.length > 1 ? ", " : ""
      }${values.slice(1).join(", ")} !important`,
    };
  },
  overrideStyle = ({
    element,
    selector = "",
    property,
    variable,
    variableAliases = {},
    valueAliases = [],
    specificity = ["mode", "value"],
    cssProps = {},
    postProcessor = (selector, cssProps) => [selector, cssProps],
  }) => {
    if (selector) element ??= document.querySelector(selector);
    const style = element?.getAttribute("style") ?? "",
      pattern = String.raw`(?:^|(?:;\s*))${property}:\s*([^;]+);?`,
      match = style.match(new RegExp(pattern));
    if (typeof variable === "string") {
      let value = match?.[1];
      if (element) {
        value ??= getComputedPropertyValue(
          element,
          property === "background" ? "background-color" : property
        );
      }
      if (!value) throw new Error(`${property} not found for ${selector}`);
      variable = cssVariable({
        name: variable,
        value: value,
        alias: variableAliases[value],
        splitValues: property === "font-family",
      });
    }
    if (specificity.includes("value")) {
      if (/(?<!rgb\()[^\s\d,]+,/g.test(selector) && !selector.includes(":is")) {
        selector = `:is(${selector})`;
      }
      if (match?.[0]) selector += `[style*="${match[0].replace(/"/g, `\\"`)}"]`;
      else {
        const propSelector = [variable.value, ...valueAliases]
          .map((value) =>
            property === "color"
              ? `[style^="color: ${value}"],
                 [style^="color:${value}"],
                 [style*=";color: ${value}"],
                 [style*=";color:${value}"],
                 [style*=" color: ${value}"],
                 [style*=" color:${value}"],
                 [style*="fill: ${value}"],
                 [style*="fill:${value}"]`
              : property === "background"
              ? `[style^="background: ${value}"],
                 [style^="background:${value}"],
                 [style*=";background: ${value}"],
                 [style*=";background:${value}"],
                 [style*=" background: ${value}"],
                 [style*=" background:${value}"],
                 [style*="background-color: ${value}"],
                 [style*="background-color:${value}"]`
              : `[style*="${property}: ${value}"],
                 [style*="${property}:${value}"]`
          )
          .join(",");
        selector += selector ? `:is(${propSelector})` : propSelector;
      }
    }
    if (specificity.includes("mode")) {
      selector =
        /(?<!rgb\()[^\s\d,]+,/g.test(selector) && !selector.includes(":is")
          ? `${bodySelector} :is(${selector})`
          : `${bodySelector} ${selector}`;
    }
    cssProps[property] = variable;
    cssProps["fill"] ??= cssProps["color"];
    [selector, cssProps] = postProcessor(selector, cssProps);
    const body = Object.entries(cssProps)
      .filter(([prop, val]) => prop && val)
      .map(([prop, val]) => `${prop}:${val?.ref ?? val}`)
      .join(";");
    cssRefs[body] ??= [];
    cssRefs[body].push(selector);
    variableAliases[variable.value] ??= variable.name;
  };

const styleFonts = () => {
  overrideStyle({
    selector: `[style*="Segoe UI"]`,
    property: "font-family",
    variable: "font-sans",
    specificity: [],
  });
  overrideStyle({
    selector: `[style*="Georgia"]`,
    property: "font-family",
    variable: "font-serif",
    specificity: [],
  });
  overrideStyle({
    selector: `[style*="iawriter-mono"]`,
    property: "font-family",
    variable: "font-mono",
    specificity: [],
  });
  overrideStyle({
    selector: `[style*="SFMono-Regular"]`,
    property: "font-family",
    variable: "font-code",
    specificity: [],
  });
};

const styleText = () => {
  const primary = cssVariable({
      name: "fg-primary",
      value: darkMode ? "rgba(255, 255, 255, 0.81)" : "rgb(55, 53, 47)",
    }),
    primaryAliases = darkMode
      ? [
          "rgb(211, 211, 211)",
          "rgb(255, 255, 255)",
          "rgba(255, 255, 255, 0.8",
          "rgba(255, 255, 255, 0.9",
          "rgba(255, 255, 255, 1",
        ]
      : [
          "rgba(255, 255, 255, 0.9)",
          "rgba(55, 53, 47, 0.8",
          "rgba(55, 53, 47, 0.9",
          "rgba(55, 53, 47, 1",
        ];

  const secondary = cssVariable({
      name: "fg-secondary",
      value: darkMode ? "rgb(155, 155, 155)" : "rgba(25, 23, 17, 0.6)",
    }),
    secondaryAliases = darkMode
      ? [
          "rgb(127, 127, 127)",
          "rgba(255, 255, 255, 0.0",
          "rgba(255, 255, 255, 0.1",
          "rgba(255, 255, 255, 0.2",
          "rgba(255, 255, 255, 0.3",
          "rgba(255, 255, 255, 0.4",
          "rgba(255, 255, 255, 0.5",
          "rgba(255, 255, 255, 0.6",
          "rgba(255, 255, 255, 0.7",
        ]
      : [
          "rgba(206, 205, 202, 0.6)",
          "rgba(55, 53, 47, 0.0",
          "rgba(55, 53, 47, 0.1",
          "rgba(55, 53, 47, 0.2",
          "rgba(55, 53, 47, 0.3",
          "rgba(55, 53, 47, 0.4",
          "rgba(55, 53, 47, 0.5",
          "rgba(55, 53, 47, 0.6",
          "rgba(55, 53, 47, 0.7",
        ];

  overrideStyle({
    property: "color",
    variable: primary,
    valueAliases: primaryAliases,
    cssProps: {
      "caret-color": primary,
      "text-decoration-color": "currentColor",
      fill: primary,
    },
  });
  overrideStyle({
    property: "color",
    variable: secondary,
    valueAliases: secondaryAliases,
    cssProps: {
      "caret-color": secondary,
      "text-decoration-color": "currentColor",
      fill: secondary,
    },
    postProcessor(selector, cssProps) {
      return [
        `${bodySelector} :is(.rdp-nav_icon, .rdp-head_cell,
              .rdp-day.rdp-day_outside, ::placeholder), ${selector}`,
        cssProps,
      ];
    },
  });
  overrideStyle({
    property: "caret-color",
    variable: primary,
    valueAliases: primaryAliases,
  });
  overrideStyle({
    property: "caret-color",
    variable: secondary,
    valueAliases: secondaryAliases,
  });
  overrideStyle({
    selector: `[style*="-webkit-text-fill-color:"]`,
    property: "-webkit-text-fill-color",
    variable: secondary,
    specificity: ["mode"],
  });

  // light mode tags have coloured text,
  // replace with primary text for inter-mode consistency
  for (const tagSelector of [
    `[style*="height: 20px; border-radius: 3px; padding-left: 6px;"][style*="background:"]`,
    `.notion-collection_view-block [style*="height: 14px; border-radius: 3px; padding-left: 6px;"]`,
    `.notion-timeline-item-properties [style*="height: 18px; border-radius: 3px; padding-left: 8px;"]`,
  ]) {
    for (const el of document.querySelectorAll(tagSelector)) {
      if (darkMode) continue;
      overrideStyle({
        element: el,
        selector: tagSelector,
        property: "color",
        variable: "fg-primary",
      });
    }
  }
};

const styleBorders = () => {
  const border = cssVariable({
      name: "fg-border",
      value: darkMode ? "rgb(47, 47, 47)" : "rgb(233, 233, 231)",
    }),
    borderColors = darkMode
      ? [border.value.slice(4, -1), "37, 37, 37", "255, 255, 255"]
      : [border.value.slice(4, -1), "238, 238, 237", "55, 53, 47"],
    boxShadows = darkMode
      ? [
          "; box-shadow: rgba(255, 255, 255, 0.094) 0px -1px 0px;",
          "; box-shadow: rgba(15, 15, 15, 0.2) 0px 0px 0px 1px inset;",
          "; box-shadow: rgb(25, 25, 25) -3px 0px 0px, rgb(47, 47, 47) 0px 1px 0px;",
        ]
      : [
          "; box-shadow: rgba(55, 53, 47, 0.09) 0px -1px 0px;",
          "; box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset;",
          "; box-shadow: white -3px 0px 0px, rgb(233, 233, 231) 0px 1px 0px;",
        ];
  for (const el of document.querySelectorAll(`[style*="box-shadow:"]`)) {
    const boxShadow = el
      .getAttribute("style")
      .match(/(?:^|(?:;\s*))box-shadow:\s*([^;]+);?/)?.[0];
    if (borderColors.some((color) => boxShadow.includes(color))) {
      boxShadows.push(boxShadow);
    }
  }

  overrideStyle({
    selector: `[style*="height: 1px;"][style*="background"]`,
    property: "background",
    variable: border,
    specificity: ["mode"],
  });
  cssBody += `
    ${bodySelector} :is(${[...new Set(borderColors)]
    .map(
      (color) =>
        `[style*="px solid rgb(${color}"], [style*="px solid rgba(${color}"]`
    )
    .join(", ")}):is([style*="border:"], [style*="border-top:"],
      [style*="border-left:"], [style*="border-bottom:"],
      [style*="border-right:"]) { border-color: ${border.ref}; }
    ${[...new Set(boxShadows)]
      .map((shadow) => {
        if (shadow.startsWith(";")) shadow = shadow.slice(1);
        return `${bodySelector} [style*="${shadow}"] { ${shadow
          .replace(
            /rgba?\([^\)]+\)/g,
            shadow.includes("-3px 0px 0px, ")
              ? "transparent"
              : `var(--theme--fg-border, ${border.value})`
          )
          .slice(0, -1)} !important; }`;
      })
      .join("")}
  `;
};

const styleColoredText = () => {
  // inline text
  for (const el of document.querySelectorAll(
    '.notion-selectable .notion-enable-hover[style*="color:"][style*="fill:"]:not([style*="mono"])'
  )) {
    if (!el.innerText || /\s/.test(el.innerText)) continue;
    overrideStyle({
      element: el,
      selector: `
        .notion-selectable .notion-enable-hover,
        .notion-code-block span.token
      `,
      property: "color",
      variable: `fg-${el.innerText}`,
    });
  }

  // block text
  for (const el of document.querySelectorAll(
    '.notion-text-block > [style*="color:"][style*="fill:"]'
  )) {
    if (!el.innerText || /\s/.test(el.innerText)) continue;
    overrideStyle({
      element: el,
      selector: `.notion-text-block > [style*="color:"][style*="fill:"]`,
      property: "color",
      variable: `fg-${el.innerText}`,
    });
  }

  // board text
  for (const group of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    // get color name from card
    const card = group.querySelector('a[style*="background"]'),
      innerText = card.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || /\s/.test(innerText)) continue;
    const el = group.querySelector('[style*="height: 32px"]'),
      groupStyle = group
        .getAttribute("style")
        .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    overrideStyle({
      element: el,
      selector: `.notion-board-view :is(
        .notion-board-group[style*="${groupStyle}"] [style*="height: 32px"],
        [style*="${groupStyle}"] > [style*="color"]:nth-child(2),
        [style*="${groupStyle}"] > div > svg
      )`,
      property: "color",
      // light_gray text doesn't exist
      variable: `fg-${innerText === "light_gray" ? "secondary" : innerText}`,
      specificity: ["mode"],
    });
  }
};

const styleBackgrounds = () => {
  const primary = cssVariable({
      name: "bg-primary",
      value: darkMode ? "rgb(25, 25, 25)" : "white",
    }),
    secondary = cssVariable({
      name: "bg-secondary",
      value: darkMode ? "rgb(32, 32, 32)" : "rgb(251, 251, 250)",
    });

  overrideStyle({
    property: "background",
    variable: primary,
    valueAliases: darkMode ? [] : ["rgb(255, 255, 255)", "rgb(247, 247, 247)"],
    postProcessor(selector, cssProps) {
      return [`${selector}:not(.notion-timeline-view)`, cssProps];
    },
  });
  overrideStyle({
    property: "background",
    variable: secondary,
    valueAliases: darkMode
      ? ["rgb(37, 37, 37)", "rgb(47, 47, 47)"]
      : ["rgb(253, 253, 253)"],
  });
  // patch: remove overlay from settings sidebar
  // to match notion-enhancer menu sidebar colour
  cssBody += `.notion-overlay-container .notion-space-settings > div > div > [style*="height: 100%; background: rgba(255, 255, 255, 0.03);"] { background: transparent !important }`;

  // cards
  overrideStyle({
    selector: `.notion-timeline-item,
      .notion-calendar-view .notion-collection-item > a,
      .notion-gallery-view .notion-collection-item > a`,
    property: "background",
    variable: secondary,
  });

  // popups
  overrideStyle({
    selector: `.notion-overlay-container [style*="border-radius: 4px;"
      ][style*="position: relative; max-width: calc(100vw - 24px); box-shadow:"],
      [style*="font-size: 12px;"][style*="box-shadow:"][
        style*="border-radius: 3px; max-width: calc(100% - 16px); min-height: 24px; overflow: hidden;"
      ][style*="position: absolute; right: 8px; bottom: 8px; z-index:"],
      [style*="height: 32px;"][style*="font-size: 14px; line-height: 1.2; border-radius: 5px; box-shadow:"],
      [style*="transition: background"][style*="cursor: pointer;"][
        style*="border-radius: 3px; height: 24px; width: 24px;"][style*="box-shadow:"],
      [style*="right: 6px; top: 4px;"][style*="border-radius: 4px;"][style*="gap: 1px;"][style*="box-shadow:"]`,
    property: "background",
    variable: secondary,
  });

  // modals
  overrideStyle({
    selector: `.notion-overlay-container [data-overlay] :is(
      [style*="height: 100%; width: 275px;"][style*="flex-direction: column;"],
      .notion-space-settings [style*="flex-grow: 1"] > [style*="background-color"])`,
    property: "background",
    variable: primary,
    specificity: ["mode"],
  });
  overrideStyle({
    selector: `.notion-overlay-container [data-overlay] :is(
      [style*="height: 100%; width: 275px;"][style*="flex-direction: column;"] + [style*="width: 100%;"],
      .notion-space-settings [style*="height: 100%; background:"][style*="max-width: 250px;"])`,
    property: "background",
    variable: secondary,
    specificity: ["mode"],
  });

  // timeline fades
  overrideStyle({
    selector: `.notion-timeline-view`,
    property: "background",
    variable: primary,
    specificity: ["mode"],
  });
  cssBody += `[style*="linear-gradient(to left, ${
    darkMode ? primary.value : "white"
  } 20%, rgba(${
    darkMode ? primary.value.slice(4, -1) : "255, 255, 255"
  }, 0) 100%)"] { background-image: linear-gradient(to left,
      var(--theme--bg-primary, ${primary.value}) 20%, transparent
    100%) !important; }
    [style*="linear-gradient(to right, ${
      darkMode ? primary.value : "white"
    } 20%, rgba(${
    darkMode ? primary.value.slice(4, -1) : "255, 255, 255"
  }, 0) 100%)"] { background-image: linear-gradient(to right,
      var(--theme--bg-primary, ${primary.value}) 20%, transparent
    100%) !important; }
  `;

  // hovered elements, inputs and unchecked toggle backgrounds
  overrideStyle({
    property: "background",
    variable: cssVariable({
      name: "bg-hover",
      value: darkMode ? "rgba(255, 255, 255, 0.055)" : "rgba(55, 53, 47, 0.08)",
    }),
    valueAliases: darkMode
      ? []
      : [
          "rgba(242, 241, 238, 0.6)",
          "rgb(225, 225, 225)",
          "rgb(239, 239, 238)",
        ],
    postProcessor(selector, cssProps) {
      selector += `, ${bodySelector} [style*="height: 14px; width: 26px; border-radius: 44px;"][style*="rgba"]`;
      if (darkMode) {
        selector += `, ${bodySelector} :is([style*="background: rgb(47, 47, 47)"],
        [style*="background-color: rgb(47, 47, 47)"])[style*="transition: background"]:hover`;
      }
      return [selector, cssProps];
    },
  });

  // modal shadow
  overrideStyle({
    selector: `.notion-overlay-container [data-overlay]
      > div > [style*="position: absolute"]:first-child`,
    property: "background",
    variable: cssVariable({
      name: "bg-overlay",
      value: darkMode ? "rgba(15, 15, 15, 0.8)" : "rgba(15, 15, 15, 0.6)",
    }),
    specificity: ["mode"],
  });
};

const styleColoredBackgrounds = () => {
  for (const targetSelector of [
    // database tags
    `[style*="height: 20px; border-radius: 3px; padding-left: 6px;"]`,
    `.notion-collection_view-block [style*="height: 14px; border-radius: 3px; padding-left: 6px;"]`,
    `:is(.notion-timeline-item-properties [style*="height: 18px; border-radius: 3px; padding-left: 8px;"],
    .notion-collection_view-block .notion-collection-item a > .notion-focusable)`,
    // inline highlights
    `.notion-selectable .notion-enable-hover[style*="background:"]`,
    // block highlights and hovered board items
    `:is(.notion-text-block > [style*="background:"],
     .notion-collection_view-block .notion-collection-item a > .notion-focusable)`,
  ]) {
    for (const el of document.querySelectorAll(targetSelector)) {
      if (!el.innerText || /\s/.test(el.innerText)) continue;
      overrideStyle({
        element: el,
        selector: targetSelector,
        property: "background",
        variable: `bg-${el.innerText}`,
      });
    }
  }

  // board cards
  for (const group of document.querySelectorAll(
    ".notion-board-view .notion-board-group"
  )) {
    const card = group.querySelector('a[style*="background"]'),
      innerText = card.innerText.replace("Drag image to reposition\n", "");
    if (!innerText || /\s/.test(innerText)) continue;
    const groupStyle = group
      .getAttribute("style")
      .match(/background(?:-color)?:\s*([^;]+);?/)[1];
    // in light mode pages in board views all have bg "white"
    // by default, must be styled based on parent
    overrideStyle({
      element: card,
      selector: `.notion-board-view .notion-board-group[style*="${groupStyle}"] a`,
      property: "background",
      variable: `bg-${innerText}`,
      specificity: ["mode"],
    });
    overrideStyle({
      element: group,
      selector: `.notion-board-view [style*="${groupStyle}"]:is(
        .notion-board-group,
        [style*="border-top-left-radius: 5px;"]
      )`,
      property: "background",
      variable: `dim-${innerText}`,
      specificity: ["mode"],
    });
  }

  // use dim for callout blocks
  for (const el of document.querySelectorAll(
    '.notion-callout-block > div > [style*="background:"]'
  )) {
    if (!el.innerText || /\s/.test(el.innerText)) continue;
    overrideStyle({
      element: el,
      selector: ".notion-callout-block > div > div",
      property: "background",
      variable: `dim-${el.innerText}`,
    });
  }
  // use yellow for notification highlights
  overrideStyle({
    property: "background",
    variable: cssVariable({
      name: "bg-yellow",
      value: "rgba(255, 212, 0, 0.14)",
    }),
    specificity: ["value"],
  });
  // use light gray for taglikes e.g. file property values
  overrideStyle({
    selector: `[style*="height: 18px; border-radius: 3px; background"]`,
    property: "background",
    variable: "bg-light_gray",
  });
};

const styleTooltips = () => {
  cssBody += `.notion-overlay-container [style*="border-radius: 3px; background:"
    ][style*="max-width: calc(100vw - 24px); box-shadow:"
    ][style*="padding: 4px 8px; font-size: 12px; line-height: 1.4; font-weight: 500;"] {
      background: rgb(15, 15, 15) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }
    .notion-overlay-container [style*="border-radius: 3px; background:"
    ][style*="max-width: calc(100vw - 24px); box-shadow:"
    ][style*="padding: 4px 8px; font-size: 12px; line-height: 1.4; font-weight: 500;"]
    > [style*="color"] { color: rgb(127, 127, 127) !important; }`;
};

const styleAccents = () => {
  const primary = cssVariable({
      name: "accent-primary",
      value: "rgb(35, 131, 226)",
    }),
    primaryHover = cssVariable({
      name: "accent-primary_hover",
      value: "rgb(0, 117, 211)",
    }),
    primaryContrast = cssVariable({
      name: "accent-primary_contrast",
      value: "rgb(255, 255, 255)",
    }),
    primaryTransparent = cssVariable({
      name: "accent-primary_transparent",
      value: "rgba(35, 131, 226, 0.14)",
    });
  overrideStyle({
    property: "color",
    variable: primary,
    specificity: ["value"],
  });
  overrideStyle({
    property: "background",
    variable: primary,
    specificity: ["value"],
    cssProps: {
      fill: primaryContrast,
      color: primaryContrast,
    },
  });
  overrideStyle({
    property: "background",
    variable: primaryHover,
    specificity: ["value"],
    cssProps: {
      fill: primaryContrast,
      color: primaryContrast,
    },
  });
  overrideStyle({
    selector: `.notion-table-selection-overlay [style*="border: 2px solid"]`,
    property: "border-color",
    variable: primary,
    specificity: [],
  });
  overrideStyle({
    selector: `
      [style*="background: ${primary.value}"] svg[style*="fill"],
      [style*="background-color: ${primary.value}"]  svg[style*="fill"]
    `,
    property: "fill",
    variable: primaryContrast,
    specificity: [],
  });
  overrideStyle({
    selector: `[style*="border-radius: 44px;"] > [style*="border-radius: 44px; background: white;"]`,
    property: "background",
    variable: primaryContrast,
    specificity: [],
  });
  overrideStyle({
    selector: `
      *::selection,
      .notion-selectable-halo,
      #notion-app .rdp-day:not(.rdp-day_disabled):not(.rdp-day_selected
      ):not(.rdp-day_value):not(.rdp-day_start):not(.rdp-day_end):hover,
      [style*="background: ${primaryTransparent.value.split(".")[0]}."],
      [style*="background:${primaryTransparent.value.split(".")[0]}."],
      [style*="background-color: ${primaryTransparent.value.split(".")[0]}."],
      [style*="background-color:${primaryTransparent.value.split(".")[0]}."]
    `,
    property: "background",
    variable: primaryTransparent,
    specificity: [],
  });

  const secondary = cssVariable({
      name: "accent-secondary",
      value: "rgb(235, 87, 87)",
    }),
    secondaryAliases = [
      "rgb(180, 65, 60)",
      "rgb(211, 79, 67)",
      "rgb(205, 73, 69)",
    ],
    secondaryHover = cssVariable({
      name: "accent-secondary_hover",
      value: "rgba(235, 87, 87, 0.1)",
    }),
    secondaryContrast = cssVariable({
      name: "accent-secondary_contrast",
      value: "white",
    });
  overrideStyle({
    property: "color",
    variable: secondary,
    valueAliases: secondaryAliases,
    specificity: ["value"],
  });
  overrideStyle({
    property: "background",
    variable: secondary,
    valueAliases: secondaryAliases,
    specificity: ["value"],
    cssProps: {
      fill: secondaryContrast,
      color: secondaryContrast,
    },
    postProcessor(selector, cssProps) {
      return [
        `#notion-app .rdp-day_today:not(.rdp-day_selected):not(.rdp-day_value
         ):not(.rdp-day_start):not(.rdp-day_end)::after, ${selector}`,
        cssProps,
      ];
    },
  });
  overrideStyle({
    property: "background",
    variable: secondary,
    valueAliases: secondaryAliases,
    specificity: ["value"],
    cssProps: {
      fill: secondaryContrast,
      color: secondaryContrast,
    },
    postProcessor(selector, cssProps) {
      delete cssProps["background"];
      return [
        `#notion-app .rdp-day_today:not(.rdp-day_selected):not(.rdp-day_value):not(.rdp-day_start
          ):not(.rdp-day_end), :is(${selector}) + :is([style*="fill: ${secondaryContrast.value};"],
          [style*="color: ${secondaryContrast.value};"]), :is(${selector})
          :is([style*="fill: ${secondaryContrast.value};"], [style*="color: ${secondaryContrast.value};"])`,
        cssProps,
      ];
    },
  });
  overrideStyle({
    property: "background",
    variable: secondaryHover,
    specificity: ["value"],
  });

  // box-shadows are complicated, style manually
  cssBody += `.notion-focusable-within:focus-within {
      box-shadow:
        var(--theme--accent-primary, ${primary.value}) 0px 0px 0px 1px inset,
        var(--theme--accent-primary, ${primary.value}) 0px 0px 0px 2px
      !important;
    }
    .notion-focusable:focus-visible {
      box-shadow:
        var(--theme--accent-primary, ${primary.value}) 0px 0px 0px 1px inset,
        var(--theme--accent-primary, ${primary.value}) 0px 0px 0px 2px
      !important;
    }
    ${["box-shadow: rgb(35, 131, 226) 0px 0px 0px 2px inset"]
      .map((shadow) => {
        return `[style*="${shadow}"] { ${shadow.replace(
          /rgba?\([^\)]+\)/g,
          `var(--theme--accent-primary, ${primary.value})`
        )} !important; }`;
      })
      .join("")}
    ${[
      "border: 1px solid rgb(110, 54, 48)",
      "border: 1px solid rgba(235, 87, 87, 0.5)",
      "border: 2px solid rgb(110, 54, 48)",
      "border: 2px solid rgb(227, 134, 118)",
      "border-right: 1px solid rgb(180, 65, 60)",
      "border-right: 1px solid rgb(211, 79, 67)",
    ]
      .map((border) => `[style*="${border}"]`)
      .join(", ")} { border-color: ${secondary.ref}; }`;
};

const styleScrollbars = () => {
  const scrollbarTrack = cssVariable({
    name: "scrollbar-track",
    value: darkMode ? "rgba(202, 204, 206, 0.04)" : "#EDECE9",
  });
  overrideStyle({
    selector: "::-webkit-scrollbar-track",
    property: "background",
    variable: scrollbarTrack,
    specificity: ["mode"],
  });
  overrideStyle({
    selector: "::-webkit-scrollbar-corner",
    property: "background",
    variable: scrollbarTrack,
    specificity: ["mode"],
  });
  overrideStyle({
    selector: "::-webkit-scrollbar-thumb",
    property: "background",
    variable: cssVariable({
      name: "scrollbar-thumb",
      value: darkMode ? "#474c50" : "#D3D1CB",
    }),
    specificity: ["mode"],
  });
  overrideStyle({
    selector: "::-webkit-scrollbar-thumb:hover",
    property: "background",
    variable: cssVariable({
      name: "scrollbar-thumb_hover",
      value: darkMode ? "rgba(202, 204, 206, 0.3)" : "#AEACA6",
    }),
    specificity: ["mode"],
  });
};

const styleCode = () => {
  overrideStyle({
    selector: `.notion-text-block .notion-enable-hover[style*="mono"]`,
    property: "color",
    variable: "code-inline_fg",
  });
  overrideStyle({
    selector: `.notion-text-block .notion-enable-hover[style*="mono"]`,
    property: "background",
    variable: "code-inline_bg",
  });

  overrideStyle({
    selector: `.notion-code-block > [style*="mono"]`,
    property: "color",
    variable: "code-block_fg",
  });
  overrideStyle({
    selector: `.notion-code-block > div > [style*="background"]`,
    property: "background",
    variable: "code-block_bg",
  });

  const aliases = {},
    code = document.querySelector(".notion-code-block .token");
  for (const token of [
    // standard tokens from https://prismjs.com/tokens.html
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
  ]) {
    code.className = `token ${token}`;
    overrideStyle({
      target: code,
      selector: `.notion-code-block .token.${token}`,
      property: "color",
      variable: `code-${token.replace(/-/g, "_")}`,
      variableAliases: aliases,
      specificity: ["mode"],
    });
  }

  // patch: remove individual backgrounds from prism tokens
  cssBody += `.token:is(
      .operator, .entity, .url,
      :is(.language-css, .style) .string
    ) { background: transparent !important; }`;
};

styleFonts();
styleText();
styleBorders();
styleColoredText();
styleBackgrounds();
styleColoredBackgrounds();
styleTooltips();
styleAccents();
styleScrollbars();
styleCode();

console.log(
  `body${modeSelector} { ${cssRoot} } ${Object.entries(cssRefs)
    .map(([body, selectors]) => `${[...new Set(selectors)].join(",")}{${body}}`)
    .join("")} ${cssBody}`.replace(/\s+/g, " ")
);
