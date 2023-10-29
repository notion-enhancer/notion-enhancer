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

      // https://github.com/notion-enhancer/notion-enhancer/issues/160:
      // enable the notion:// protocol, windows-style tab layouts, and
      // quitting the app when the last window is closed on linux
      scriptContent = scriptContent.replace(
        /(?:"win32"===process\.platform(?:(?=,isFullscreen)|(?=&&\w\.BrowserWindow)|(?=&&\(\w\.app\.requestSingleInstanceLock)))/g,
        '["win32","linux"].includes(process.platform)'
      );

      // restore node integration in the renderer process
      // so the notion-enhancer can be require()-d into it
      scriptContent = replaceIfNotFound(
        scriptContent,
        /spellcheck:!0,sandbox:!0/g,
        "spellcheck:!0,nodeIntegration:true"
      );

      // https://github.com/notion-enhancer/desktop/issues/291
      // bypass csp issues by intercepting the notion:// protocol
      const protocolHandler =
        "try{const t=await p.assetCache.handleRequest(e);";
      scriptContent = replaceIfNotFound(
        scriptContent,
        protocolHandler,
        `{const n="notion://www.notion.so/__notion-enhancer/";if(e.url.startsWith(n))return require("electron").net.fetch(\`file://\${require("path").join(__dirname,"..","..","node_modules","notion-enhancer",e.url.slice(n.length))}\`)}${protocolHandler}`
      );

      // bypass webRequest filter to load enhancer menu
      return replaceIfNotFound(
        scriptContent,
        /r\.top!==r\?t\({cancel:!0}\)/g,
        "r.top!==r?t({})"
      );
    },
    [rendererScript]: (scriptContent) => injectTriggerOnce(rendererScript, scriptContent)
  };

export default (scriptId, scriptContent) => {
  if (patches["*"]) scriptContent = patches["*"](scriptId, scriptContent);
  if (patches[scriptId]) scriptContent = patches[scriptId](scriptContent);
  return scriptContent;
};
