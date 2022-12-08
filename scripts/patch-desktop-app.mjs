/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const patches = {
  "*": async (scriptId, scriptContent) => {
    const prevTriggerFound = /require\(['|"]notion-enhancer['|"]\)/.test(scriptContent);
    if (prevTriggerFound) return scriptContent;
    const enhancerTrigger =
      '\n\n/*notion-enhancer*/require("notion-enhancer")' +
      `('${scriptId}',exports,(js)=>eval(js));`;
    return scriptContent + enhancerTrigger;
  },

  "main/main": async (scriptContent) => {
    // https://github.com/notion-enhancer/desktop/issues/160
    // enable the notion:// url scheme/protocol on linux
    const searchValue = /process.platform === "win32"/g,
      replaceValue = 'process.platform === "win32" || process.platform === "linux"';
    if (scriptContent.includes(replaceValue)) return scriptContent;
    return scriptContent.replace(searchValue, replaceValue);
  },

  "main/schemeHandler": async (scriptContent) => {
    // https://github.com/notion-enhancer/desktop/issues/291
    // bypass csp issues by intercepting notion:// protocol
    const searchValue =
        "protocol.registerStreamProtocol(config_1.default.protocol, async (req, callback) => {",
      replaceValue = `${searchValue}
        { /* notion-enhancer */
        const schemePrefix = "notion://www.notion.so/__notion-enhancer/";
        if (req.url.startsWith(schemePrefix)) {
          const { search, hash, pathname } = new URL(req.url),
            fileExt = pathname.split(".").reverse()[0],
            filePath = \`../node_modules/notion-enhancer/\${req.url.slice(
                schemePrefix.length,
                -(search.length + hash.length)
            )}\`;
          callback({
            data: require("fs").createReadStream(require("path").resolve(\`\${__dirname}/\${filePath}\`)),
            headers: { "content-type": require("notion-enhancer/vendor/content-types.min.js").get(fileExt) },
          });
        }
        }`;
    if (scriptContent.includes(replaceValue)) return scriptContent;
    return scriptContent.replace(searchValue, replaceValue);
  },

  "main/systemMenu": async (scriptContent) => {
    // exposes template for modification
    const searchValue = "electron_1.Menu.setApplicationMenu(menu);",
      replaceValue = `${searchValue} return template;`;
    if (scriptContent.includes(replaceValue)) return scriptContent;
    return scriptContent.replace(searchValue, replaceValue);
  },
};

export default async (scriptId, scriptContent) => {
  if (patches["*"]) scriptContent = await patches["*"](scriptId, scriptContent);
  if (patches[scriptId]) scriptContent = await patches[scriptId](scriptContent);
  return scriptContent;
};
