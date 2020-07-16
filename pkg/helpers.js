/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';
const os = require('os'),
  path = require('path'),
  fs = require('fs-extra'),
  { exec, execSync } = require('child_process'),
  { promisify } = require('util');

// used to differentiate between "enhancer failed" and "code broken" errors.
class EnhancerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnhancerError';
  }
}

// checks if being run on the windows subsystem for linux:
// used to modify windows notion app.
const is_wsl =
    process.platform === 'linux' &&
    os.release().toLowerCase().includes('microsoft'),
  // ~/.notion-enhancer absolute path.
  data_folder = path.resolve(
    is_wsl
      ? (() => {
          const stdout = execSync('cmd.exe /c echo %systemdrive%%homepath%', {
              encoding: 'utf8',
            }),
            drive = stdout[0];
          return `/mnt/${drive.toLowerCase()}${stdout
            .replace(/\\/g, '/')
            .slice(2)
            .trim()}`;
        })()
      : os.homedir(),
    '.notion-enhancer'
  );

// transform a wsl filepath to its relative windows filepath if necessary.
// every file path inserted by hack.js should be put through this.
function realpath(hack_path) {
  if (!is_wsl) return hack_path;
  hack_path = fs.realpathSync(hack_path);
  if (hack_path.startsWith('/mnt/')) {
    hack_path = `${hack_path[5].toUpperCase()}:${hack_path.slice(6)}`;
  } else hack_path = `//wsl$/${process.env.WSL_DISTRO_NAME}${hack_path}`;
  return hack_path;
}

// gets possible system notion app filepaths.
async function getNotion() {
  let folder = '';
  switch (process.platform) {
    case 'darwin':
      folder = '/Applications/Notion.app/Contents/Resources';
      break;
    case 'win32':
      folder = process.env.LOCALAPPDATA + '\\Programs\\Notion\\resources';
      break;
    case 'linux':
      if (is_wsl) {
        const { stdout } = await promisify(exec)(
            'cmd.exe /c echo %localappdata%'
          ),
          drive = stdout[0];
        folder = `/mnt/${drive.toLowerCase()}${stdout
          .replace(/\\/g, '/')
          .slice(2)
          .trim()}/Programs/Notion/resources`;
      } else {
        for (let loc of [
          '/usr/lib/notion-desktop/resources', // https://github.com/davidbailey00/notion-deb-builder/
          '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
          '/opt/notion', // https://github.com/jaredallard/notion-app
        ]) {
          if (await fs.pathExists(loc)) folder = loc;
        }
      }
  }
  if (!folder)
    throw new EnhancerError(
      'platform not supported: open a request in the github repo:\n' +
        'https://github.com/dragonwocky/notion-enhancer/issues/new?assignees=&labels=enhancement&template=platform-support.md'
    );
  // check if actual app files are present.
  // if app/app.asar are missing but app.asar.bak present it will be moved to app.asar
  const app_asar = path.resolve(folder, 'app.asar');
  if (
    !(
      (await fs.pathExists(folder)) &&
      ((await fs.pathExists(app_asar)) ||
        (await fs.pathExists(path.resolve(folder, 'app'))))
    )
  ) {
    const asar_bak = path.resolve(folder, 'app.asar.bak');
    if (await fs.pathExists(asar_bak)) {
      await fs.move(asar_bak, app_asar);
    } else
      throw new EnhancerError(
        'nothing found: notion installation is either corrupted or non-existent.'
      );
  }
  return folder;
}

// attempts to read a JSON file, falls back to empty object.
function getJSON(from) {
  try {
    return fs.readJsonSync(from);
  } catch (err) {
    return {};
  }
}

// wait for console input, returns keys when enter pressed.
function readline() {
  return new Promise((res, rej) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (key) => {
      if (key === '\u0003') process.exit(); // CTRL+C
      process.stdin.pause();
      res(key.trim());
    });
  });
}

module.exports = {
  EnhancerError,
  is_wsl,
  data_folder,
  realpath,
  getNotion,
  getJSON,
  readline,
};
