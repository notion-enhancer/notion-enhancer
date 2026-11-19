/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

// patch scripts within notion's sources to
// activate and respond to the notion-enhancer
const isTriggerInjected = (content) =>
    /require\(['|"]notion-enhancer['|"]\)/.test(content) ||
    content.includes("notion-enhancer:read-source"),
  injectTriggerOnce = (file, content) =>
    content +
    (!isTriggerInjected(content)
      ? `\n\nrequire("notion-enhancer")("${file}",exports,(js)=>eval(js));`
      : ""),
  // renderer processes are sandboxed and cannot require() from disk:
  // the notion-enhancer is instead loaded from the main process via ipc
  injectSandboxedTriggerOnce = (file, content) =>
    content +
    (!isTriggerInjected(content)
      ? `\n\ntry{const m={exports:{}};new Function("require","module","process",require("electron")` +
        `.ipcRenderer.sendSync("notion-enhancer:read-source","preload.cjs"))(require,m,process);` +
        `m.exports("${file}",exports,(js)=>eval(js));}catch(e){console.error("notion-enhancer:",e);}`
      : ""),
  replaceIfNotFound = ({ string, mode = "replace" }, search, replacement) =>
    string.includes(replacement)
      ? string
      : string.replace(
          search,
          typeof replacement === "string" && mode === "append"
            ? `$&${replacement}`
            : typeof replacement === "string" && mode === "prepend"
            ? `${replacement}$&`
            : replacement
        );

const patches = {
  // prettier-ignore
  ".webpack/main/index.js": (file, content) => {
    content = injectTriggerOnce(file, content);
    const replace = (...args) =>
        (content = replaceIfNotFound(
          { string: content, mode: "replace" },
          ...args
        )),
      prepend = (...args) =>
        (content = replaceIfNotFound(
          { string: content, mode: "prepend" },
          ...args
        )),
      append = (...args) =>
        (content = replaceIfNotFound(
          { string: content, mode: "append" },
          ...args
        ));

    // https://github.com/notion-enhancer/notion-enhancer/issues/160:
    // run the app in windows mode on linux (instead of macos mode)
    const isWindows =
        /(?:"win32"===process\.platform(?:(?=,isFullscreen)|(?=&&\w\.BrowserWindow)|(?=&&\(\w\.app\.requestSingleInstanceLock)))/g,
      isWindowsOrLinux = '["win32","linux"].includes(process.platform)';
    replace(isWindows, isWindowsOrLinux);

    // notion's renderer processes are left sandboxed: preload scripts
    // load the notion-enhancer via ipc instead (see src/preload.cjs)

    // expose the app's config + cache + preferences to the global namespace
    // e.g. to enable development mode or check if keep in background is enabled
    // (preferences are updated by dispatching app/updatePreferences to the store)
    prepend(/\w+\.exports=JSON\.parse\('\{"env":"production"/, "globalThis.__notionConfig=");
    prepend(/\(0,\w+\.configureStore\)\(\{reducer:/, "globalThis.__notionStore=");

    return content;
  },
  ".webpack/renderer/tabs/preload.js": injectSandboxedTriggerOnce,
  ".webpack/renderer/tab_browser_view/preload.js": injectSandboxedTriggerOnce,
};

const decoder = new TextDecoder(),
  encoder = new TextEncoder();
export default (file, content) => {
  if (!patches[file]) return content;
  content = decoder.decode(content);
  content = patches[file](file, content);
  return encoder.encode(content);
};
