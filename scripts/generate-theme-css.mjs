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
  cssBody = "";

const getComputedPropertyValue = (el, prop) => {
    const styles = window.getComputedStyle(el),
      value = styles.getPropertyValue(prop);
    return value;
  },
  cssVariable = ({ name, value, alias, splitValues = false }) => {
    const values = splitValues ? value.split(", ") : [value];
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
      const value =
        match?.[1] ??
        (element ? getComputedPropertyValue(element, property) : "");
      if (!value) throw new Error(`${property} not found for ${selector}`);
      variable = cssVariable({
        name: variable,
        value: value,
        alias: variableAliases[value],
        splitValues: property === "font-family",
      });
    }
    if (specificity.includes("mode")) selector = `${bodySelector} ${selector}`;
    if (specificity.includes("value")) {
      if (selector.includes(",")) selector = `:is(${selector})`;
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
                 [style*=" color:${value}"]`
              : property === "background"
              ? `[style*="background: ${value}"],
                 [style*="background:${value}"]
                 [style*="background-color: ${value}"],
                 [style*="background-color:${value}"]`
              : `[style*="${property}: ${value}"],
                 [style*="${property}:${value}"]`
          )
          .join(",");
        selector += selector ? `:is(${propSelector})` : propSelector;
      }
    }
    cssProps[property] = variable;
    [selector, cssProps] = postProcessor(selector, cssProps);
    cssBody += `${selector}{${Object.entries(cssProps)
      .map(([prop, val]) => `${prop}:${val?.ref ?? val}`)
      .join(";")}}`;
    variableAliases[variable.value] ??= variable.name;
  };

const styleFonts = () => {
    overrideStyle({
      selector: "[style*='Segoe UI']",
      property: "font-family",
      variable: "font-sans",
      specificity: [],
    });
    overrideStyle({
      selector: "[style*='Georgia']",
      property: "font-family",
      variable: "font-serif",
      specificity: [],
    });
    overrideStyle({
      selector: "[style*='iawriter-mono']",
      property: "font-family",
      variable: "font-mono",
      specificity: [],
    });
    overrideStyle({
      selector: "[style*='SFMono-Regular']",
      property: "font-family",
      variable: "font-code",
      specificity: [],
    });
  },
  styleAccents = () => {
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
      property: "fill",
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
      secondaryContrast = cssVariable({
        name: "accent-secondary_contrast",
        value: "white",
      }),
      secondaryTransparent = cssVariable({
        name: "accent-secondary_transparent",
        value: "rgba(235, 87, 87, 0.1)",
      });
    overrideStyle({
      property: "color",
      variable: secondary,
      valueAliases: secondaryAliases,
      specificity: ["value"],
    });
    overrideStyle({
      property: "fill",
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
      postProcessor: (selector, cssProps) => [
        `#notion-app .rdp-day_today:not(.rdp-day_selected):not(.rdp-day_value
         ):not(.rdp-day_start):not(.rdp-day_end)::after, ${selector}`,
        cssProps,
      ],
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
      postProcessor: (selector, cssProps) => {
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
      variable: secondaryTransparent,
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
          `var(--theme--accent-primary, ${primary})`
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
      .join(", ")} { border-color: var(--theme--accent-secondary,
      ${secondary.value}) !important; }`;
  },
  styleScrollbars = () => {
    overrideStyle({
      selector: "::-webkit-scrollbar-track, ::-webkit-scrollbar-corner",
      property: "background",
      variable: cssVariable({
        name: "scrollbar-track",
        value: darkMode ? "rgba(202, 204, 206, 0.04)" : "#EDECE9",
      }),
    });
    overrideStyle({
      selector: "::-webkit-scrollbar-thumb",
      property: "background",
      variable: cssVariable({
        name: "scrollbar-thumb",
        value: darkMode ? "#474c50" : "#D3D1CB",
      }),
    });
    overrideStyle({
      selector: "::-webkit-scrollbar-thumb:hover",
      property: "background",
      variable: cssVariable({
        name: "scrollbar-thumb_hover",
        value: darkMode ? "rgba(202, 204, 206, 0.3)" : "#AEACA6",
      }),
    });
  },
  styleCode = () => {
    overrideStyle({
      selector: '.notion-text-block .notion-enable-hover[style*="mono"]',
      property: "color",
      variable: "code-inline_fg",
    });
    overrideStyle({
      selector: '.notion-text-block .notion-enable-hover[style*="mono"]',
      property: "background",
      variable: "code-inline_bg",
    });

    overrideStyle({
      selector: '.notion-code-block > [style*="mono"]',
      property: "color",
      variable: "code-block_fg",
    });
    overrideStyle({
      selector: '.notion-code-block > div > [style*="background"]',
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
styleAccents();
styleScrollbars();
styleCode();

cssBody = cssBody.replace(/\s+/g, " ");
console.log(`body${modeSelector} { ${cssRoot} } ${cssBody}`);
