/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import asar from "@electron/asar";
import os from "node:os";
import { promises as fsp, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

import patch from "./patch-desktop-app.mjs";

let __notionResources, __enhancerCache;
const nodeRequire = createRequire(import.meta.url),
  manifest = nodeRequire("../package.json"),
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
  },
  readdirDeep = async (dir) => {
    dir = resolve(dir);
    let files = [];
    for (let file of await fsp.readdir(dir)) {
      if (["node_modules", ".git"].includes(file)) continue;
      file = join(dir, file);
      const stat = await fsp.lstat(file);
      if (stat.isDirectory()) {
        files = files.concat(await readdirDeep(file));
      } else if (stat.isSymbolicLink()) {
        //
      } else files.push(file);
    }
    return files;
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
    const manifestPath = getResourcePath("app/node_modules/notion-enhancer/package.json");
    if (!existsSync(manifestPath)) return undefined;
    const insertVersion = nodeRequire(manifestPath).version;
    return insertVersion;
  };

const unpackApp = () => {
    const appPath = getAppPath();
    if (!appPath || !appPath.endsWith("asar")) return false;
    // asar reads synchronously
    asar.extractAll(appPath, appPath.replace(/\.asar$/, ""));
    return true;
  },
  applyEnhancements = async () => {
    const appPath = getAppPath();
    if (!appPath || appPath.endsWith("asar")) return false;
    const srcPath = fileURLToPath(new URL("../src", import.meta.url)),
      insertPath = getResourcePath("app/node_modules/notion-enhancer");
    if (existsSync(insertPath)) await fsp.rm(insertPath, { recursive: true });
    // insert the notion-enhancer/src folder into notion's node_modules folder
    const excludedDests = [
      getResourcePath("app/node_modules/notion-enhancer/browser"),
      getResourcePath("app/node_modules/notion-enhancer/manifest.json"),
    ];
    await fsp.cp(srcPath, insertPath, {
      recursive: true,
      // exclude browser-specific files
      filter: (_, dest) => !excludedDests.includes(dest),
    });
    // call patch-desktop-app.mjs on each file
    const notionScripts = (await readdirDeep(appPath)).filter((file) => file.endsWith(".js")),
      scriptUpdates = [];
    for (const file of notionScripts) {
      const scriptId = file.slice(appPath.length + 1, -3).replace(/\\/g, "/"),
        scriptContent = await fsp.readFile(file, { encoding: "utf8" }),
        patchedContent = await patch(scriptId, scriptContent),
        changesMade = patchedContent !== scriptContent;
      if (changesMade) scriptUpdates.push(fsp.writeFile(file, patchedContent));
    }
    // create package.json
    const manifestPath = getResourcePath("app/node_modules/notion-enhancer/package.json"),
      insertManifest = { ...manifest, main: "electron/init.cjs" };
    // remove cli-specific fields
    delete insertManifest.bin;
    delete insertManifest.type;
    delete insertManifest.engines;
    delete insertManifest.dependencies;
    delete insertManifest.packageManager;
    scriptUpdates.push(fsp.writeFile(manifestPath, JSON.stringify(insertManifest)));
    await Promise.all(scriptUpdates);
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
