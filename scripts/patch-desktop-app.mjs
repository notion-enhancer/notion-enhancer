/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const replaceIfNotFound = (string, search, replacement) =>
  string.includes(replacement) ? string : string.replace(search, replacement);

// require()-ing the notion-enhancer in worker scripts
// or in renderer scripts will throw errors => manually
// inject trigger into only the necessary scripts
// (avoid re-injection on re-enhancement)
const injectTriggerOnce = (scriptId, scriptContent) =>
  scriptContent +
  (!/require\(['|"]notion-enhancer['|"]\)/.test(scriptContent)
    ? `\n\nrequire("notion-enhancer")('${scriptId}',exports,(js)=>eval(js));`
    : "");

const mainScript = ".webpack/main/index",
  rendererScript = ".webpack/renderer/tab_browser_view/preload",
  patches = {
    [mainScript]: (scriptContent) => {
      scriptContent = injectTriggerOnce(mainScript, scriptContent);
      const replace = (...args) =>
        (scriptContent = replaceIfNotFound(scriptContent, ...args));

      // https://github.com/notion-enhancer/notion-enhancer/issues/160:
      // enable the notion:// protocol, windows-style tab layouts, and
      // quitting the app when the last window is closed on linux
      const isWindows =
          /(?:"win32"===process\.platform(?:(?=,isFullscreen)|(?=&&\w\.BrowserWindow)|(?=&&\(\w\.app\.requestSingleInstanceLock)))/g,
        isWindowsOrLinux = '["win32","linux"].includes(process.platform)';
      replace(isWindows, isWindowsOrLinux);

      // restore node integration in the renderer process
      // so the notion-enhancer can be require()-d into it
      replace("spellcheck:!0,sandbox:!0", "spellcheck:!0,nodeIntegration:true");

      // bypass webRequest filter to load enhancer menu
      replace("r.top!==r?t({cancel:!0})", "r.top!==r?t({})");

      // https://github.com/notion-enhancer/desktop/issues/291
      // bypass csp issues by intercepting the notion:// protocol
      const protocolHandler = `try{const t=await p.assetCache.handleRequest(e);`,
        protocolInterceptor = `{const n="notion://www.notion.so/__notion-enhancer/";if(e.url.startsWith(n))return require("electron").net.fetch(\`file://\${require("path").join(__dirname,"..","..","node_modules","notion-enhancer",e.url.slice(n.length))}\`)}`;
      replace(protocolHandler, protocolInterceptor + protocolHandler);

      // expose the app config to the global namespace for manipulation
      // e.g. to enable development mode
      const configDeclaration = `e.exports=JSON.parse('{"env":"production"`,
        configInterceptor = `globalThis.__notionConfig=${configDeclaration}`;
      replace(configDeclaration, configInterceptor);

      // expose the app store to the global namespace for reading
      // e.g. to check if keep in background is enabled
      const storeDeclaration = "t.Store=(0,p.configureStore)",
        updateDeclaration = "t.updatePreferences=n.updatePreferences",
        storeInterceptor = `globalThis.__notionStore=${storeDeclaration}`,
        updateInterceptor = `globalThis.__updatePreferences=${updateDeclaration}`;
      replace(storeDeclaration, storeInterceptor);
      replace(updateDeclaration, updateInterceptor);

      return scriptContent;
    },
    [rendererScript]: (scriptContent) =>
      injectTriggerOnce(rendererScript, scriptContent),
  };

export default (scriptId, scriptContent) => {
  if (patches["*"]) scriptContent = patches["*"](scriptId, scriptContent);
  if (patches[scriptId]) scriptContent = patches[scriptId](scriptContent);
  return scriptContent;
};
