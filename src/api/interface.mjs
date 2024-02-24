/**
 * notion-enhancer
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import htm from "../vendor/htm.mjs";
import lucide from "../vendor/lucide.mjs";
import {
  createGenerator,
  expandVariantGroup,
} from "../vendor/@unocss-core.mjs";
import { presetUno } from "../vendor/@unocss-preset-uno.mjs";
import "../assets/icons.svg.js";

// prettier-ignore
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const svgElements = ["animate","animateMotion","animateTransform","circle","clipPath","defs","desc","discard","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","foreignObject","g","hatch","hatchpath","image","line","linearGradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialGradient","rect","script","set","stop","style","svg","switch","symbol","text","textPath","title","tspan","use","view"],
  htmlAttributes = ["accept","accept-charset","accesskey","action","align","allow","alt","async","autocapitalize","autocomplete","autofocus","autoplay","background","bgcolor","border","buffered","capture","challenge","charset","checked","cite","class","code","codebase","color","cols","colspan","content","contenteditable","contextmenu","controls","coords","crossorigin","csp","data","data-*","datetime","decoding","default","defer","dir","dirname","disabled","download","draggable","enctype","enterkeyhint","for","form","formaction","formenctype","formmethod","formnovalidate","formtarget","headers","height","hidden","high","href","hreflang","http-equiv","icon","id","importance","integrity","inputmode","ismap","itemprop","keytype","kind","label","lang","loading","list","loop","low","max","maxlength","minlength","media","method","min","multiple","muted","name","novalidate","open","optimum","pattern","ping","placeholder","playsinline","poster","preload","radiogroup","readonly","referrerpolicy","rel","required","reversed","role","rows","rowspan","sandbox","scope","selected","shape","size","sizes","slot","span","spellcheck","src","srcdoc","srclang","srcset","start","step","style","tabindex","target","title","translate","type","usemap","value","width","wrap","accent-height","accumulate","additive","alignment-baseline","alphabetic","amplitude","arabic-form","ascent","attributeName","attributeType","azimuth","baseFrequency","baseline-shift","baseProfile","bbox","begin","bias","by","calcMode","cap-height","clip","clipPathUnits","clip-path","clip-rule","color-interpolation","color-interpolation-filters","color-profile","color-rendering","contentScriptType","contentStyleType","cursor","cx","cy","d","decelerate","descent","diffuseConstant","direction","display","divisor","dominant-baseline","dur","dx","dy","edgeMode","elevation","enable-background","end","exponent","fill","fill-opacity","fill-rule","filter","filterRes","filterUnits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","format","from","fr","fx","fy","g1","g2","glyph-name","glyph-orientation-horizontal","glyph-orientation-vertical","glyphRef","gradientTransform","gradientUnits","hanging","horiz-adv-x","horiz-origin-x","ideographic","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kernelMatrix","kernelUnitLength","kerning","keyPoints","keySplines","keyTimes","lengthAdjust","letter-spacing","lighting-color","limitingConeAngle","local","marker-end","marker-mid","marker-start","markerHeight","markerUnits","markerWidth","mask","maskContentUnits","maskUnits","mathematical","mode","numOctaves","offset","opacity","operator","order","orient","orientation","origin","overflow","overline-position","overline-thickness","panose-1","paint-order","path","pathLength","patternContentUnits","patternTransform","patternUnits","pointer-events","points","pointsAtX","pointsAtY","pointsAtZ","preserveAlpha","preserveAspectRatio","primitiveUnits","r","radius","referrerPolicy","refX","refY","rendering-intent","repeatCount","repeatDur","requiredExtensions","requiredFeatures","restart","result","rotate","rx","ry","scale","seed","shape-rendering","slope","spacing","specularConstant","specularExponent","speed","spreadMethod","startOffset","stdDeviation","stemh","stemv","stitchTiles","stop-color","stop-opacity","strikethrough-position","strikethrough-thickness","string","stroke","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke-width","surfaceScale","systemLanguage","tableValues","targetX","targetY","text-anchor","text-decoration","text-rendering","textLength","to","transform","transform-origin","u1","u2","underline-position","underline-thickness","unicode","unicode-bidi","unicode-range","units-per-em","v-alphabetic","v-hanging","v-ideographic","v-mathematical","values","vector-effect","version","vert-adv-y","vert-origin-x","vert-origin-y","viewBox","viewTarget","visibility","widths","word-spacing","writing-mode","x","x-height","x1","x2","xChannelSelector","xlink:actuate","xlink:arcrole","xlink:href","xlink:role","xlink:show","xlink:title","xlink:type","xml:base","xml:lang","xml:space","y","y1","y2","yChannelSelector","z","zoomAndPan"];

// accelerators approximately match electron accelerators.
// logic used when recording hotkeys in menu matches logic used
// when triggering hotkeys => detection should be reliable.
// default hotkeys using "alt" may trigger an altcode or
// accented character on some keyboard layouts (not recommended).
let keyListeners = [];
const modifierAliases = [
    ["metaKey", ["meta", "os", "win", "cmd", "command"]],
    ["ctrlKey", ["ctrl", "control"]],
    ["shiftKey", ["shift"]],
    ["altKey", ["alt"]],
  ],
  addKeyListener = (accelerator, callback, waitForKeyup = false) => {
    if (typeof accelerator === "string") accelerator = accelerator.split("+");
    accelerator = accelerator.map((key) => key.toLowerCase());
    keyListeners.push([accelerator, callback, waitForKeyup]);
  },
  removeKeyListener = (callback) => {
    keyListeners = keyListeners.filter(([, c]) => c !== callback);
  },
  handleKeypress = (event, keyListeners) => {
    for (const [accelerator, callback] of keyListeners) {
      const acceleratorModifiers = [],
        combinationTriggered =
          accelerator.every((key) => {
            for (const [modifier, aliases] of modifierAliases) {
              if (aliases.includes(key)) {
                acceleratorModifiers.push(modifier);
                return true;
              }
            }
            if (key === "space") key = " ";
            if (key === "plus") key = "equal";
            if (key === "minus") key = "-";
            if (key === "\\") key = "backslash";
            if (key === ",") key = "comma";
            if (key === ".") key = "period";
            const keyPressed = [
              event.key.toLowerCase(),
              event.code.toLowerCase(),
            ].includes(key);
            return keyPressed;
          }) &&
          modifierAliases.every(([modifier]) => {
            // required && used -> matches accelerator
            // !required && !used -> matches accelerator
            // (required && !used) || (!required && used) -> no match
            // differentiates e.g.ctrl + x from ctrl + shift + x
            return acceleratorModifiers.includes(modifier) === event[modifier];
          });
      if (combinationTriggered) callback(event);
    }
  },
  onKeyup = (event) => {
    const keyupListeners = keyListeners //
      .filter(([, , waitForKeyup]) => waitForKeyup);
    handleKeypress(event, keyupListeners);
  },
  onKeydown = (event) => {
    const keydownListeners = keyListeners //
      .filter(([, , waitForKeyup]) => !waitForKeyup);
    handleKeypress(event, keydownListeners);
  };
document.removeEventListener("keyup", onKeyup);
document.removeEventListener("keydown", onKeydown);
document.addEventListener("keyup", onKeyup);
document.addEventListener("keydown", onKeydown);

// mutation listeners observe updates to the dom.
// by default, the criteria for matching a selector
// is very broad. custom opts can be passed when
// adding a listener to reduce handler calls
let documentObserver,
  observerDefaults = {
    // whether to observe attribute updates
    attributes: true,
    // whether to observe innerText updates
    characterData: true,
    // whether to observe added/removed nodes
    childList: true,
    // whether to observe parent/descendant nodes
    subtree: true,
  },
  mutationListeners = [];
const _mutations = [],
  addMutationListener = (selector, callback, opts) => {
    opts = { ...observerDefaults, ...opts };
    mutationListeners.push([selector, callback, opts]);
  },
  removeMutationListener = (callback) => {
    mutationListeners = mutationListeners.filter(([, c]) => c !== callback);
  },
  selectorMutated = (mutation, selector, opts) => {
    if (!opts.attributes && mutation.type === "attributes") return false;
    if (!opts.characterData && mutation.type === "characterData") return false;
    const target =
      mutation.type === "characterData"
        ? mutation.target.parentElement
        : mutation.target;
    if (!target) return false;
    const matchesTarget = target.matches(selector),
      matchesParent = opts.subtree && target.matches(`${selector} *`),
      matchesChild = opts.subtree && target.querySelector(selector),
      matchesAdded =
        opts.childList &&
        [...(mutation.addedNodes || [])].some((node) => {
          if (!(node instanceof HTMLElement)) node = node.parentElement;
          return node?.querySelector(selector);
        });
    return matchesTarget || matchesParent || matchesChild || matchesAdded;
  },
  handleMutations = () => {
    let mutation;
    while ((mutation = _mutations.shift())) {
      for (const [selector, callback, subtree] of mutationListeners)
        if (selectorMutated(mutation, selector, subtree)) callback(mutation);
    }
  },
  attachObserver = () => {
    if (document.readyState !== "complete") return;
    document.removeEventListener("readystatechange", attachObserver);
    (documentObserver ??= new MutationObserver((mutations, _observer) => {
      if (!_mutations.length) requestIdleCallback(handleMutations);
      _mutations.push(...mutations);
    })).disconnect();
    documentObserver.observe(document.body, observerDefaults);
  };
document.addEventListener("readystatechange", attachObserver);
attachObserver();

const kebabToPascalCase = (string) =>
    string[0].toUpperCase() +
    string.replace(/-[a-z]/g, (match) => match.slice(1).toUpperCase()).slice(1),
  hToString = (type, props, ...children) =>
    `<${type}${Object.entries(props)
      .map(([attr, value]) => ` ${attr}="${value}"`)
      .join("")}>${children
      .map((child) => (Array.isArray(child) ? hToString(...child) : child))
      .join("")}</${type}>`,
  // combines instance-provided element props
  // with a template of element props such that
  // island/component/template props handlers
  // and styles can be preserved and extended
  // rather than overwritten
  extendProps = (props, extend) => {
    for (const key in extend) {
      const { [key]: value } = props;
      if (typeof extend[key] === "function") {
        props[key] = (...args) => {
          extend[key](...args);
          if (typeof value === "function") value(...args);
        };
      } else if (key === "class") {
        props[key] = value ? `${value} ${extend[key]}` : extend[key];
      } else props[key] = extend[key] ?? value;
    }
    return props;
  },
  // enables use of the jsx-like htm syntax
  // for building components and interfaces
  // with tagged templates. instantiates dom
  // elements directly, does not use a vdom.
  // e.g. html`<div class=${className}></div>`
  h = function (type, props, ...children) {
    // disables element caching
    this[0] = 3;
    children = children.flat(Infinity);
    if (typeof type === "function") {
      // html`<${Component} attr="value">Click Me<//>`
      return type(props ?? {}, ...children);
    }
    const elem = svgElements.includes(type)
      ? document.createElementNS("http://www.w3.org/2000/svg", type)
      : document.createElement(type);
    for (const prop in props ?? {}) {
      if (typeof props[prop] === "undefined") continue;
      if (["class", "className"].includes(prop)) {
        // collapse multiline classes &
        // expand utility variant class groups
        props[prop] = props[prop].replace(/\s+/g, " ");
        props[prop] = expandVariantGroup(props[prop]).trim();
        elem.setAttribute("un-cloak", "");
      }
      if (htmlAttributes.includes(prop) || prop.includes("-")) {
        if (typeof props[prop] === "boolean") {
          if (!props[prop]) continue;
          elem.setAttribute(prop, "");
        } else elem.setAttribute(prop, props[prop]);
      } else elem[prop] = props[prop];
    }
    if (type === "style") {
      elem.append(children.join("").replace(/\s+/g, " "));
    } else elem.append(...children);
    return elem;
  },
  html = htm.bind(h);

const iconPattern = /^i-((?:\w|-)+)(?:\?(mask|bg|auto))?$/,
  svgToUri = (svg) => {
    // https://gist.github.com/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
    const xlmns = ~svg.indexOf("xmlns")
      ? "<svg"
      : '<svg xmlns="http://www.w3.org/2000/svg"';
    return `url("data:image/svg+xml;utf8,${svg
      .replace("<svg", xlmns)
      .replace(/"/g, "'")
      .replace(/%/g, "%25")
      .replace(/#/g, "%23")
      .replace(/{/g, "%7B")
      .replace(/}/g, "%7D")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
      .replace(/\s+/g, " ")
      .trim()}")`;
  },
  // prefer custom preset over @unocss/preset-icons:
  // limits icons to single set, avoids loading over
  // cdn (otherwise could cause issues when submitting
  // to the chrome webstore). also makes custom icon
  // handling straightforward
  presetIcons = ([, icon, mode]) => {
    let svg,
      mask = mode === "mask";
    if (icon === "notion-enhancer") {
      const { iconColour, iconMonochrome } = globalThis.__enhancerApi;
      svg = mask ? iconMonochrome : iconColour;
    } else {
      icon = kebabToPascalCase(icon);
      if (!lucide[icon]) return;
      const [type, props, children] = lucide[icon];
      svg = hToString(type, props, ...children);
    }
    mask ||= mode !== "bg" && svg.includes("currentColor");
    return {
      // https://antfu.me/posts/icons-in-pure-css
      display: "inline-block",
      height: "1em",
      width: "1em",
      [mask ? "mask" : "background"]: `${svgToUri(svg)} no-repeat`,
      [mask ? "mask-size" : "background-size"]: "100% 100%",
      "background-color": mask ? "currentColor" : "transparent",
    };
  };

let _renderedTokens = -1;
const _tokens = new Set(),
  _stylesheet = html`<style id="__unocss"></style>`,
  uno = createGenerator({
    presets: [presetUno()],
    preflights: [{ getCSS: () => `[un-cloak]{display:none!important}` }],
    rules: [[iconPattern, presetIcons, { layer: "icons" }]],
    layers: { preflights: -2, icons: -1, default: 1 },
  }),
  extractTokens = ($root) => {
    if (!$root?.classList) return;
    for (const t of $root.classList) _tokens.add(t);
    for (const $ of $root.children) extractTokens($);
    $root.removeAttribute("un-cloak");
  },
  renderStylesheet = async () => {
    if (_renderedTokens === _tokens.size) return;
    _renderedTokens = _tokens.size;
    const res = await uno.generate(_tokens);
    if (!document.contains(_stylesheet)) document.head.append(_stylesheet);
    if (_stylesheet.innerHTML !== res.css) _stylesheet.innerHTML = res.css;
  };
addMutationListener("*", (mutation) => {
  const targets = [];
  if (mutation.type === "childList") {
    for (const node of mutation.addedNodes) extractTokens(node);
  } else if (mutation.type === "attributes") extractTokens(mutation.target);
  else return;
  renderStylesheet();
});
renderStylesheet();

Object.assign((globalThis.__enhancerApi ??= {}), {
  html,
  extendProps,
  addKeyListener,
  removeKeyListener,
  addMutationListener,
  removeMutationListener,
});
