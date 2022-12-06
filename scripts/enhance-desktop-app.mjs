/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import asar from "@electron/asar";
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
    // e.g. with the --path cli option
    __notionResources = path;
  },
  getResourcePath = (path) => {
    if (__notionResources) return resolve(`${__notionResources}/${path}`);
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
      return resolve(`${__notionResources}/${path}`);
    }
  },
  // prefer unpacked if both exist
  getAppPath = () => ["app", "app.asar"].map(getResourcePath).find(existsSync),
  getBackupPath = () => ["app.bak", "app.asar.bak"].map(getResourcePath).find(existsSync),
  getCachePath = () => {
    if (__enhancerCache) return __enhancerCache;
    const home = platform === "wsl" ? polyfillWslEnv("HOMEPATH") : os.homedir();
    __enhancerCache = resolve(`${home}/.notion-enhancer`);
    return __enhancerCache;
  },
  checkEnhancementVersion = () => {
    const insertPath = getResourcePath("app/node_modules/notion-enhancer");
    if (!existsSync(insertPath)) return undefined;
    const insertManifest = getResourcePath("app/node_modules/notion-enhancer/package.json"),
      insertVersion = nodeRequire(insertManifest).version;
    return insertVersion;
  };

const unpackApp = () => {
    const appPath = getAppPath();
    if (!appPath || !appPath.endsWith("asar")) return false;
    asar.extractAll(appPath, appPath.replace(/\.asar$/, ""));
    return true;
  },
  applyEnhancements = () => {
    const appPath = getAppPath();
    if (!appPath || appPath.endsWith("asar")) return false;
    // ...
    return true;
  },
  takeBackup = async () => {
    const appPath = getAppPath();
    if (!appPath) return false;
    const backupPath = getBackupPath();
    if (backupPath) await fsp.rm(backupPath, { recursive: true });
    const destPath = `${appPath}.bak`;
    if (!appPath.endsWith(".asar")) {
      await fsp.cp(appPath, destPath, { recursive: true });
    } else await fsp.rename(appPath, destPath);
    return true;
  },
  restoreBackup = async () => {
    const backupPath = getBackupPath();
    if (!backupPath) return false;
    const destPath = backupPath.replace(/\.bak$/, "");
    if (existsSync(destPath)) await fsp.rm(destPath, { recursive: true });
    await fsp.rename(backupPath, destPath);
    const appPath = getAppPath();
    if (destPath !== appPath) await fsp.rm(appPath, { recursive: true });
    return true;
  },
  removeCache = async () => {
    if (!existsSync(getCachePath())) return;
    await fsp.rm(getCachePath());
    return true;
  };

export {
  getResourcePath,
  getAppPath,
  getBackupPath,
  getCachePath,
  checkEnhancementVersion,
  setNotionPath,
  unpackApp,
  applyEnhancements,
  takeBackup,
  restoreBackup,
  removeCache,
};
