/**
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/**
 * log-based shading of an rgb color, from
 * https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 * @param {number} shade - a decimal amount to shade the color.
 * 1 = white, 0 = the original color, -1 = black
 * @param {string} color - the rgb color
 * @returns {string} the shaded color
 */
export const rgbLogShade = (shade, color) => {
  const int = parseInt,
    round = Math.round,
    [a, b, c, d] = color.split(","),
    t = shade < 0 ? 0 : shade * 255 ** 2,
    p = shade < 0 ? 1 + shade : 1 - shade;
  return (
    "rgb" +
    (d ? "a(" : "(") +
    round((p * int(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 + t) ** 0.5) +
    "," +
    round((p * int(b) ** 2 + t) ** 0.5) +
    "," +
    round((p * int(c) ** 2 + t) ** 0.5) +
    (d ? "," + d : ")")
  );
};

/**
 * pick a contrasting color e.g. for text on a variable color background
 * using the hsp (perceived brightness) constants from http://alienryderflex.com/hsp.html
 * @param {number} r - red (0-255)
 * @param {number} g - green (0-255)
 * @param {number} b - blue (0-255)
 * @returns {string} the contrasting rgb color, white or black
 */
export const rgbContrast = (r, g, b) => {
  return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) > 165.75
    ? "rgb(0,0,0)"
    : "rgb(255,255,255)";
};

let _hotkeyListenersActivated = false,
  _hotkeyEventListeners = [],
  _documentObserver,
  _documentObserverListeners = [];
const _documentObserverEvents = [];

/**
 * wait until a page is loaded and ready for modification
 * @param {array=} selectors - wait for the existence of elements that match these css selectors
 * @returns {Promise} a promise that will resolve when the page is ready
 */
export const whenReady = (selectors = []) => {
  return new Promise((res, _rej) => {
    const onLoad = () => {
      const interval = setInterval(isReady, 100);
      function isReady() {
        const ready = selectors.every((selector) => document.querySelector(selector));
        if (!ready) return;
        clearInterval(interval);
        res(true);
      }
      isReady();
    };
    if (document.readyState !== "complete") {
      document.addEventListener("readystatechange", (_event) => {
        if (document.readyState === "complete") onLoad();
      });
    } else onLoad();
  });
};

/**
 * parse the current location search params into a usable form
 * @returns {Map<string, string>} a map of the url search params
 */
export const queryParams = () => new URLSearchParams(window.location.search);

/**
 * replace special html characters with escaped versions
 * @param {string} str
 * @returns {string} escaped string
 */
export const escape = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/\\/g, "&#x5C;");

/**
 * a tagged template processor for raw html:
 * stringifies, minifies, and syntax highlights
 * @example web.raw`<p>hello</p>`
 * @returns {string} the processed html
 */
export const raw = (str, ...templates) => {
  const html = str
    .map(
      (chunk) =>
        chunk +
        (["string", "number"].includes(typeof templates[0])
          ? templates.shift()
          : escape(JSON.stringify(templates.shift(), null, 2) ?? ""))
    )
    .join("");
  return html.includes("<pre")
    ? html.trim()
    : html
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.length)
        .join(" ");
};

/**
 * create a single html element inc. attributes and children from a string
 * @example web.html`<p>hello</p>`
 * @returns {Element} the constructed html element
 */
export const html = (str, ...templates) => {
  const $fragment = document.createRange().createContextualFragment(raw(str, ...templates));
  return $fragment.children.length === 1 ? $fragment.children[0] : $fragment.children;
};

/**
 * appends a list of html elements to a parent
 * @param $container - the parent element
 * @param $elems - the elements to be appended
 * @returns {Element} the updated $container
 */
export const render = ($container, ...$elems) => {
  $elems = $elems
    .map(($elem) => ($elem instanceof HTMLCollection ? [...$elem] : $elem))
    .flat(Infinity)
    .filter(($elem) => $elem);
  $container.append(...$elems);
  return $container;
};

/**
 * removes all children from an element without deleting them/their behaviours
 * @param $container - the parent element
 * @returns {Element} the updated $container
 */
export const empty = ($container) => {
  while ($container.firstChild && $container.removeChild($container.firstChild));
  return $container;
};

/**
 * loads/applies a css stylesheet to the page
 * @param {string} path - a url or within-the-enhancer filepath
 */
export const loadStylesheet = (path) => {
  const $stylesheet = html`<link
    rel="stylesheet"
    href="${path.startsWith("https://") ? path : fs.localPath(path)}"
  />`;
  render(document.head, $stylesheet);
  return $stylesheet;
};

/**
 * copy text to the clipboard
 * @param {string} str - the string to copy
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (str) => {
  try {
    await navigator.clipboard.writeText(str);
  } catch {
    const $el = document.createElement("textarea");
    $el.value = str;
    $el.setAttribute("readonly", "");
    $el.style.position = "absolute";
    $el.style.left = "-9999px";
    document.body.appendChild($el);
    $el.select();
    document.execCommand("copy");
    document.body.removeChild($el);
  }
};

/**
 * read text from the clipboard
 * @returns {Promise<string>}
 */
export const readFromClipboard = () => {
  return navigator.clipboard.readText();
};

const triggerHotkeyListener = (event, hotkey) => {
  const inInput = document.activeElement.nodeName === "INPUT" && !hotkey.listenInInput;
  if (inInput) return;
  const modifiers = {
      metaKey: ["meta", "os", "win", "cmd", "command"],
      ctrlKey: ["ctrl", "control"],
      shiftKey: ["shift"],
      altKey: ["alt"],
    },
    pressed = hotkey.keys.every((key) => {
      key = key.toLowerCase();
      for (const modifier in modifiers) {
        const pressed = modifiers[modifier].includes(key) && event[modifier];
        if (pressed) {
          // mark modifier as part of hotkey
          modifiers[modifier] = [];
          return true;
        }
      }
      if (key === "space") key = " ";
      if (key === "plus") key = "+";
      if (key === event.key.toLowerCase()) return true;
    });
  if (!pressed) return;
  // test for modifiers not in hotkey
  // e.g. to differentiate ctrl+x from ctrl+shift+x
  for (const modifier in modifiers) {
    const modifierPressed = event[modifier],
      modifierNotInHotkey = modifiers[modifier].length > 0;
    if (modifierPressed && modifierNotInHotkey) return;
  }
  hotkey.callback(event);
};

/**
 * register a hotkey listener to the page
 * @param {array|string} keys - the combination of keys that will trigger the hotkey.
 * key codes can be tested at http://keycode.info/ and are case-insensitive.
 * available modifiers are 'alt', 'ctrl', 'meta', and 'shift'.
 * can be provided as a + separated string.
 * @param {function} callback - called whenever the keys are pressed
 * @param {object=} opts - fine-tuned control over when the hotkey should be triggered
 * @param {boolean=} opts.listenInInput - whether the hotkey callback should be triggered
 * when an input is focused
 * @param {boolean=} opts.keydown - whether to listen for the hotkey on keydown.
 * by default, hotkeys are triggered by the keyup event.
 */
export const addHotkeyListener = (
  keys,
  callback,
  { listenInInput = false, keydown = false } = {}
) => {
  if (typeof keys === "string") keys = keys.split("+");
  _hotkeyEventListeners.push({ keys, callback, listenInInput, keydown });

  if (!_hotkeyListenersActivated) {
    _hotkeyListenersActivated = true;
    document.addEventListener("keyup", (event) => {
      for (const hotkey of _hotkeyEventListeners.filter(({ keydown }) => !keydown)) {
        triggerHotkeyListener(event, hotkey);
      }
    });
    document.addEventListener("keydown", (event) => {
      for (const hotkey of _hotkeyEventListeners.filter(({ keydown }) => keydown)) {
        triggerHotkeyListener(event, hotkey);
      }
    });
  }
};
/**
 * remove a listener added with web.addHotkeyListener
 * @param {function} callback
 */
export const removeHotkeyListener = (callback) => {
  _hotkeyEventListeners = _hotkeyEventListeners.filter(
    (listener) => listener.callback !== callback
  );
};

/**
 * add a listener to watch for changes to the dom
 * @param {onDocumentObservedCallback} callback
 * @param {string[]=} selectors
 */
export const addDocumentObserver = (callback, selectors = []) => {
  if (!_documentObserver) {
    const handle = (queue) => {
      while (queue.length) {
        const event = queue.shift(),
          matchesAddedNode = ($node, selector) =>
            $node instanceof Element &&
            ($node.matches(selector) ||
              $node.matches(`${selector} *`) ||
              $node.querySelector(selector)),
          matchesTarget = (selector) =>
            event.target.matches(selector) ||
            event.target.matches(`${selector} *`) ||
            [...event.addedNodes].some(($node) => matchesAddedNode($node, selector));
        for (const listener of _documentObserverListeners) {
          if (!listener.selectors.length || listener.selectors.some(matchesTarget)) {
            listener.callback(event);
          }
        }
      }
    };
    _documentObserver = new MutationObserver((list, _observer) => {
      if (!_documentObserverEvents.length)
        requestIdleCallback(() => handle(_documentObserverEvents));
      _documentObserverEvents.push(...list);
    });
    _documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
  _documentObserverListeners.push({ callback, selectors });
};

/**
 * remove a listener added with web.addDocumentObserver
 * @param {onDocumentObservedCallback} callback
 */
export const removeDocumentObserver = (callback) => {
  _documentObserverListeners = _documentObserverListeners.filter(
    (listener) => listener.callback !== callback
  );
};

/**
 * @callback onDocumentObservedCallback
 * @param {MutationRecord} event - the observed dom mutation event
 */
