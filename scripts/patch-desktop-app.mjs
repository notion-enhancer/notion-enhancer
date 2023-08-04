/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const replaceIfNotFound = (string, search, replacement) =>
  string.includes(replacement) ? string : string.replace(search, replacement);

const patches = {
  "*": async (scriptId, scriptContent) => {
    if (scriptId === 'forge.config.js') return scriptContent;
    const prevTriggerPattern = /require\(['|"]notion-enhancer['|"]\)/,
      prevTriggerFound = prevTriggerPattern.test(scriptContent);
    if (prevTriggerFound) return scriptContent;
    const enhancerTrigger =
      '\n\n/*notion-enhancer*/require("notion-enhancer")' +
      `('${scriptId}',exports,(js)=>eval(js));`;
    return scriptContent + enhancerTrigger;
  },

  "main/main": async (scriptContent) => {
    // https://github.com/notion-enhancer/desktop/issues/160
    // enable the notion:// url scheme/protocol on linux
    const search = /process.platform === "win32"/g,
      // prettier-ignore
      replacement = 'process.platform === "win32" || process.platform === "linux"';
    return replaceIfNotFound(scriptContent, search, replacement);
  },

  "main/schemeHandler": async (scriptContent) => {
    // https://github.com/notion-enhancer/desktop/issues/291
    // bypass csp issues by intercepting notion:// protocol
    // prettier-ignore
    const protocolSearch = "protocol.registerStreamProtocol(config_1.default.protocol, async (req, callback) => {",
      protocolReplacement = `${protocolSearch}
        {/*notion-enhancer*/
        const schemePrefix = "notion://www.notion.so/__notion-enhancer/";
        if (req.url.startsWith(schemePrefix)) {
          const { search, hash, pathname } = new URL(req.url),
            fileExt = pathname.split(".").reverse()[0],
            filePath = \`../node_modules/notion-enhancer/\${req.url.slice(
                schemePrefix.length,
                -(search.length + hash.length) || undefined
            )}\`;
          return callback({
            data: require("fs").createReadStream(require("path").resolve(\`\${__dirname}/\${filePath}\`)),
            headers: { "content-type": require("notion-enhancer/vendor/content-types.min.js").get(fileExt) },
          });
        }}`,
      filterSearch = "function guardAgainstIFrameRequests(webRequest) {",
      filterReplacement = `${filterSearch}/*notion-enhancer*/return;`;
    return replaceIfNotFound(
      replaceIfNotFound(scriptContent, filterSearch, filterReplacement),
      protocolSearch,
      protocolReplacement
    );
  },

  "main/systemMenu": async (scriptContent) => {
    // exposes template for modification
    const search = "}\nexports.setupSystemMenu = setupSystemMenu;",
      replacement = `    return template;\n${search}`;
    return replaceIfNotFound(scriptContent, search, replacement);
  },
};

export default async (scriptId, scriptContent) => {
  if (patches["*"]) scriptContent = await patches["*"](scriptId, scriptContent);
  if (patches[scriptId]) scriptContent = await patches[scriptId](scriptContent);
  return scriptContent;
};
