/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import os from 'os';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

export const __dirname = (meta) => path.dirname(fileURLToPath(meta.url));

export const pkg = (filepath = `${__dirname(import.meta)}/../package.json`) => {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(filepath)));
  } catch {
    return {};
  }
};

export const platform =
  process.platform === 'linux' && os.release().toLowerCase().includes('microsoft')
    ? 'wsl'
    : process.platform;

let __notion;
export const findNotion = () => {
  if (__notion) return __notion;
  switch (platform) {
    case 'darwin':
      __notion = '';
      const userInstall = `/Users/${process.env.USER}/Applications/Notion.app/Contents/Resources`,
        globalInstall = '/Applications/Notion.app/Contents/Resources';
      if (fs.existsSync(userInstall)) {
        __notion = userInstall;
      } else if (fs.existsSync(globalInstall)) {
        __notion = globalInstall;
      }
      break;
    case 'win32':
      __notion = process.env.LOCALAPPDATA + '\\Programs\\Notion\\resources';
      break;
    case 'wsl':
      const [drive, ...windowsPath] = execSync('cmd.exe /c echo %localappdata%', {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      __notion = `/mnt/${drive.toLowerCase()}${windowsPath
        .slice(1, -2)
        .join('')
        .replace(/\\/g, '/')}/Programs/Notion/resources`;
      break;
    case 'linux':
      // https://aur.archlinux.org/packages/notion-app/
      if (fs.existsSync('/opt/notion-app')) __notion = '/opt/notion-app';
  }
  return __notion;
};

let __enhancerCache;
export const findEnhancerCache = () => {
  if (__enhancerCache) return __enhancerCache;
  let home = os.homedir();
  if (platform === 'wsl') {
    const [drive, ...windowsPath] = execSync('cmd.exe /c echo %systemdrive%%homepath%', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    home = `/mnt/${drive.toLowerCase()}${windowsPath
      .slice(1, -2)
      .join('')
      .replace(/\\/g, '/')}`;
  }
  __enhancerCache = path.resolve(`${home}/.notion-enhancer`);
  return __enhancerCache;
};

export const copyDir = async (src, dest) => {
  src = path.resolve(src);
  dest = path.resolve(dest);
  if (!fs.existsSync(dest)) await fsp.mkdir(dest);
  for (let file of await fsp.readdir(src)) {
    const stat = await fsp.lstat(path.join(src, file));
    if (stat.isDirectory()) {
      await copyDir(path.join(src, file), path.join(dest, file));
    } else if (stat.isSymbolicLink()) {
      await fsp.symlink(await fsp.readlink(path.join(src, file)), path.join(dest, file));
    } else await fsp.copyFile(path.join(src, file), path.join(dest, file));
  }
  return true;
};

export const readDirDeep = async (dir) => {
  dir = path.resolve(dir);
  let files = [];
  for (let file of await fsp.readdir(dir)) {
    if (['node_modules', '.git'].includes(file)) continue;
    file = path.join(dir, file);
    const stat = await fsp.lstat(file);
    if (stat.isDirectory()) {
      files = files.concat(await readDirDeep(file));
    } else if (stat.isSymbolicLink()) {
      files.push({ type: 'symbolic', path: file });
    } else files.push({ type: 'file', path: file });
  }
  return files;
};
