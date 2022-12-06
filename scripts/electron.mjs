/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import chalk from "chalk-template";
import os from "node:os";
import { promises as fsp, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

let __notionResources, __enhancerCache;
const nodeRequire = createRequire(import.meta.url),
  platform =
    process.platform === "linux" && os.release().toLowerCase().includes("microsoft")
      ? "wsl"
      : process.platform,
  polyfillWslEnv = (name) => {
    if (platform !== "wsl" || process.env[name]) return process.env[name];
    // adds a windows environment variable to process.env
    // in a wsl environment, inc. path conversion
    const value = execSync(`cmd.exe /c echo %${name}%`, {
        encoding: "utf8",
        stdio: "pipe",
      }).trim(),
      isAbsolutePath = /^[a-zA-Z]:[\\\/]/.test(value),
      onSystemDrive = /^[\\\/]/.test(value);
    if (isAbsolutePath) {
      // e.g. C:\Program Files
      const drive = value[0].toLowerCase(),
        path = value.slice(2).replace(/\\/g, "/");
      process.env[name] = `/mnt/${drive}${path}`;
    } else if (onSystemDrive) {
      // e.g. \Program Files
      const drive = polyfillWslEnv("SYSTEMDRIVE")[0].toLowerCase(),
        path = value.replace(/\\/g, "/");
      process.env[name] = `/mnt/${drive}${path}`;
    } else process.env[name] = value;
    return process.env[name];
  };

const setNotionPath = (path) => {
    // sets notion resource path to user provided value
    // e.g. from cli
    __notionResources = path;
  },
  getNotionResources = () => {
    if (__notionResources) return __notionResources;
    polyfillWslEnv("LOCALAPPDATA");
    polyfillWslEnv("PROGRAMW6432");
    const potentialPaths = [
      // [["targeted", "platforms"], "/path/to/notion/resources"]
      [["darwin"], `/Users/${process.env.USER}/Applications/Notion.app/Contents/Resources`],
      [["darwin"], "/Applications/Notion.app/Contents/Resources"],
      [["win32", "wsl"], resolve(`${process.env.LOCALAPPDATA}/Programs/Notion/resources`)],
      [["win32", "wsl"], resolve(`${process.env.PROGRAMW6432}/Notion/resources`)],
      // https://aur.archlinux.org/packages/notion-app/
      [["linux"], "/opt/notion-app"],
    ];
    for (const [targetPlatforms, testPath] of potentialPaths) {
      if (!targetPlatforms.includes(platform)) continue;
      if (!existsSync(testPath)) continue;
      __notionResources = testPath;
      return __notionResources;
    }
  },
  getEnhancerCache = () => {
    if (__enhancerCache) return __enhancerCache;
    const home = platform === "wsl" ? polyfillWslEnv("HOMEPATH") : os.homedir();
    __enhancerCache = resolve(`${home}/.notion-enhancer`);
    return __enhancerCache;
  };

const checkEnhancementStatus = () => {
  const resourcePath = (path) => resolve(`${getNotionResources()}/${path}`),
    doesResourceExist = (path) => existsSync(resourcePath(path));

  const isAppUnpacked = doesResourceExist("app"),
    isAppPacked = doesResourceExist("app.asar"),
    isBackupUnpacked = doesResourceExist("app.bak"),
    isBackupPacked = doesResourceExist("app.asar.bak"),
    isEnhancerInserted = doesResourceExist("app/node_module/notion-enhancer"),
    enhancerInsertManifest = isEnhancerInserted
      ? resourcePath("app/node_module/notion-enhancer/package.json")
      : undefined;

  // prefer unpacked if both exist: extraction is slow
  return {
    appPath: isAppUnpacked
      ? resourcePath("app")
      : isAppPacked
      ? resourcePath("app.asar")
      : undefined,
    backupPath: isBackupUnpacked
      ? resourcePath("app.bak")
      : isBackupPacked
      ? resourcePath("app.asar.bak")
      : undefined,
    cachePath: existsSync(getEnhancerCache()) //
      ? getEnhancerCache()
      : undefined,
    insertVersion: isEnhancerInserted
      ? nodeRequire(enhancerInsertManifest).version
      : undefined,
  };
};

export { checkEnhancementStatus, setNotionPath };
